import { getElementFromUrl } from "../../common/common";
import { PropertyType } from "../../types/itemType"
import { CheerioAPI } from "cheerio";


const baseUrl = 'https://apps.hhs.texas.gov/LTCSearch/'


/**
* Function for Scrape Texas data from external page Content  
@param item: object  that will be updated on db
*/

async function scrapeFromDetailsPage(item: PropertyType) {

    let $ = await getElementFromUrl(item.url)
    let elements = $('.main-content > div > div > div  ul  li').toArray()
    for await (let elem of elements) {
        if ($(elem).text().includes('Bed Count')) {
            item.capacity = $(elem).text().replace(/\D/g, '')
        }
    }
    let html: any = $(".main-content > div > div > p").first().html()
    let startIndex = html?.indexOf('fa-phone') + 14
    html = html?.slice(startIndex, html.length)
    let endIndex = html?.indexOf('<br>')
    item.phone = html?.slice(0, endIndex)?.trim()


    return item
}

/**
* Function for Scrape Texas data from Cheerio Content  
@param $: CheerioAPI content from browser
*/

export const scrapeTexusInfoFromTable = async ($: CheerioAPI) => {
    let providers: PropertyType[] = []
    let elements = $('.sortabletable tbody tr').toArray()
    for await (let elem of elements) {
        let item = {} as PropertyType

        item.name = $('td:nth-child(1)', elem).text()
        item.address = $('td:nth-child(2)', elem).text()
        item.city = $('td:nth-child(3)', elem).text()
        item.zipcode = $('td:nth-child(4)', elem).text()
        item.country = $('td:nth-child(5)', elem).text()
        item.type = $('td:nth-child(6)', elem).text()
        let url = baseUrl + $('td:nth-child(1)', elem).find('a').attr('href')
        item.url = url || ''
        item.state = 'Texas'
        if (item.url) {
            item = await scrapeFromDetailsPage(item)
            providers.push(item)
        }
    }
    await Promise.all(providers)

    return providers
}