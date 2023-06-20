import { resolve } from "path";
import { getElementFromUrl } from "../../common/common";
import { PropertyType } from "../../types/itemType"
import { CheerioAPI } from "cheerio";

const baseUrl = 'https://quality.healthfinder.fl.gov/facilitylocator/'

export const scrapeFloridaInfoFromTable = async ($: CheerioAPI) => {

    let providers: PropertyType[] = []
    let elements = $('#ctl00_mainContentPlaceHolder_dgFacilities tbody tr').toArray()
    for await (let elem of elements) {
        let item = {} as PropertyType
        if ($(elem).attr('class') != 'tableResultsHead') {
            item.name = $('td:nth-child(1)', elem).find('a').text()
            item.type = $('td:nth-child(2)', elem).text()
            item.address = $('td:nth-child(3)', elem).text()
            item.city = $('td:nth-child(4)', elem).text()
            item.zipcode = $('td:nth-child(6)', elem).text()
            item.phone = $('td:nth-child(7)', elem).text()
            item.country = $('td:nth-child(5)', elem).text()
            item.capacity = $('td:nth-child(8)', elem).text()
            let url = baseUrl + $('td:nth-child(1)', elem).find('a').attr('href')
            item.url = url || ''
            item.state = 'Florida'
        }
        if (item.url) {
            providers.push(item)
        }
    }
    await Promise.all(providers)
    return providers
}