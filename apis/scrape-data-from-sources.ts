
import { NextFunction, Request, Response } from "express";
import { executeQuery, readFileFromCsv, siteAndUrl, tables } from "../common/common";
import cheerio from "cheerio";
import { scrapeTexusInfoFromTable } from "../sites/texas";
import puppeteer, { Page } from "puppeteer";
import { PropertyType } from "../types/itemType";
import { scrapeFloridaInfoFromTable } from "../sites/florida";
import { loadImagesAndUpload } from "../common/fileService";


/**
* Function for Update/Manipulate Page Content
@param page: puppeteer page that needs to manipulate 
@param inputSelector: selector where we input the @param inputValue
@param inputValue: name value of property
@param optionSelector: selector where we select the tyoe @param optionValue
@param optionValue: option value of property
@param buttonSelector: selector where we trigger the button to change the page content
@param waitForSelector: selector I wait after triggering the button
*/

async function updatePageContent(page: Page, inputSelector: string, inputValue: string, optionSelector: string, optionValue: string, buttonSelector: string, waitForSelector: string) {
    try {
        await page.waitForSelector(inputSelector)
        await page.focus(inputSelector)
        await page.keyboard.type(inputValue)
        await page.select(optionSelector, optionValue)
        await page.click(buttonSelector);
        // await sleep(1000)
        await page.waitForSelector(waitForSelector)
        return page
    }
    catch (err) {
        throw err
    }
}

/**
* Function for handle cases for different sources 
@param page: puppeteer page that needs to manipulate 
@param property: based on this we give specified selector to update 
*/

async function handleCasesForDifferentSources(page: Page, property: any) {
    let providers: PropertyType[] = []
    try {
        let inputSelector = '#searchterm'
        let optionSelector = '#factype'
        let optionValue = 'all,all'
        let buttonSelector = 'button[type="submit"]'
        let waitingSelector = inputSelector
        let func = scrapeTexusInfoFromTable
        if (property.State == 'Florida') {
            inputSelector = '#ctl00_mainContentPlaceHolder_FacilityName'
            optionSelector = '#ctl00_mainContentPlaceHolder_FacilityType'
            buttonSelector = 'input[type="submit"]'
            waitingSelector = '#ctl00_mainContentPlaceHolder_tblFilterOptions'
            optionValue = 'ALL'
            func = scrapeFloridaInfoFromTable
        }
        page = await updatePageContent(page, inputSelector, property.Name, optionSelector, optionValue, buttonSelector, waitingSelector)
        const content = await page.content()
        const $ = cheerio.load(content)
        providers = await func($)

        return providers
    }
    catch (err) {
        throw err
    }
}



/**
* Function for load images and upload to db
@param providers: the list of data which I got from scrapping those sources
@param propertyId: the id we can identify where the providers belongs to
@param propertyName: the name of those properties
*/

async function updateProviders(providers: PropertyType[], propertyId: string | number, propertyName: string) {
    try {
        for (let provider of providers) {
            let searchQuery = `select id from ${tables.providers} where name='${propertyName}' and property_id='${propertyId}' and zipcode='${provider.zipcode}'`
            let response = await executeQuery(searchQuery)
            if (!response.length) {
                let insertQuery = `insert into ${tables.providers}
            (name, address, city, country, phone,type,zipcode,capacity,state,property_id) 
            values('${propertyName}','${provider.address}','${provider.city}','${provider.country}',
            '${provider.phone}','${provider.type}','${provider.zipcode}','${provider.capacity}','${provider.state}',${propertyId})`
                await executeQuery(insertQuery)
            }
            else {
                for (let row of response) {
                    let updateQuery = `UPDATE ${tables.providers}
                    SET name='${propertyName}',city='${provider.city}',country='${provider.country}',
                    phone='${provider.phone}',type='${provider.type}',address='${provider.address}',
                    capacity='${provider.capacity}',state='${provider.state}' 
                    where id =${row.id}
                    `
                    await executeQuery(updateQuery)
                }
            }
        }
    }
    catch (err) {
        throw err
    }
}

/**
* API Function for scrappe data from sources and store on db
@param req: request from client side
@param res: res which will recieve on client side
@param next: if I need to go throw any kind of function after processing business logic.
*/

const scrapeDataFromSources = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    // Read the properties from csv file
    let filepath = 'sample_data/Sample_Properties_Data.csv'
    var properties: any = await readFileFromCsv(filepath);

    // Launches the headless browser using puppeteer
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });

    // Opens new tab on browser 
    const page = await browser.newPage();

    // Used try catch for handling errors
    try {
        // Iterate the properties for scrapping
        for await (let property of properties) {
            // Navigate the browser to the exact page based on property state (eg : Texas, Florida)
            await page.goto(siteAndUrl[property.State], { waitUntil: 'domcontentloaded', timeout: 0 });

            // Handle cases for different state or sources (eg : Texas, Florida)
            let providers: PropertyType[] = await handleCasesForDifferentSources(page, property)

            // Search on db if the property already exist on table
            let tableName = tables.properties
            let searchQuery = `select * from ${tableName} where name = '${property.Name}'`
            let response = await executeQuery(searchQuery)

            // If the property not exist on table
            if (!response.length) {
                // Create the property
                let insertQuery = `insert into ${tableName}
                    (name , state) values('${property.Name}','${property.State}')`
                await executeQuery(insertQuery)
                let searchQuery = `select * from ${tableName} where name = '${property.Name}'`
                response = await executeQuery(searchQuery)

                // Read Images And Upload to db
                await loadImagesAndUpload(property.Name, response[0].id)
            }

            // Update providers on db
            await updateProviders(providers, response[0].id, property.Name)
        }

        // After all done close the headless browser
        await browser.close()

        // Sent the response to client
        res.status(200).json({
            success: true,
            message: 'Data Scraped Successfully',
        })
    }
    catch (err) {
        await browser.close()
        console.log(err)
        res.status(500).json({
            success: false,
            message: 'Data Scraping Failed',
        })
    }
}

export default scrapeDataFromSources