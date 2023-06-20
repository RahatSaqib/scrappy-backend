import { getElementFromUrl } from "../../common/common";
import { PropertyType } from "../../types/itemType"
import { CheerioAPI } from "cheerio";


const baseUrl = 'https://apps.hhs.texas.gov/LTCSearch/'

async function scrapeFromDetailsPage(items: PropertyType[]) {
    for await (let item of items) {
        let $ = await getElementFromUrl(item.url)
        let elements = $('#p7TP3c1_1 div ul li').toArray()
        for await (let elem of elements) {
            if ($(elem).text().includes('Bed Count')) {
                item.capacity = $(elem).text().replace(/\D/g, '')
            }
            item.phone = $("#p7EHCd_2 p i.fa-phone").first().nextUntil("i").addBack().text();
        }
    }
    return items
}

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
            providers.push(item)
        }
        let readFilesFromFl
    }
    await Promise.all(providers)
    providers = await scrapeFromDetailsPage(providers)

    return providers
}