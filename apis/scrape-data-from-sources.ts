
import { NextFunction, Request, Response } from "express";
import DB from "../config/connectToDatabase";
import { executeQuery, readFileFromCsv, siteAndUrl, sleep, tables } from "../common/common";
import cheerio from "cheerio";
import { scrapeTexusInfoFromTable } from "../sites/texas";
import puppeteer, { Page } from "puppeteer";
import { PropertyType } from "../types/itemType";
import { scrapeFloridaInfoFromTable } from "../sites/florida";
import fs from 'fs/promises'
import path from 'path'
import { uploadFileToAWS } from "../common/fileService";

async function updatePageContent(page: Page, inputSelector: string, inputValue: string, optionSelector: string, optionValue: string, buttonSelector: string) {
    try {
        await page.waitForSelector(inputSelector)
        await page.focus(inputSelector)
        await page.keyboard.type(inputValue)
        await page.select(optionSelector, optionValue)
        await page.click(buttonSelector);
        await sleep(1000)
        return page
    }
    catch (err) {
        throw err
    }
}

async function handleEdgeCases(page: Page, property: any, providers: Array<any>) {
    try {
        let inputSelector = '#searchterm'
        let optionSelector = '#factype'
        let optionValue = 'all,all'
        let buttonSelector = 'button[type="submit"]'
        let func = scrapeTexusInfoFromTable
        if (property.State == 'Florida') {
            inputSelector = '#ctl00_mainContentPlaceHolder_FacilityName'
            optionSelector = '#ctl00_mainContentPlaceHolder_FacilityType'
            buttonSelector = 'input[type="submit"]'
            optionValue = 'ALL'
            func = scrapeFloridaInfoFromTable
        }
        page = await updatePageContent(page, inputSelector, property.Name, optionSelector, optionValue, buttonSelector)
        const content = await page.content()
        const $ = cheerio.load(content)
        providers = await func($)

        return providers
    }
    catch (err) {
        throw err
    }
}
async function loadImagesAndUpload(foldername: string, propertyId: number) {
    let folderPath = 'sample_data/' + foldername
    let files = await fs.readdir(folderPath)
    try {
        for await (let file of files) {
            let filepath = path.join(__dirname, '..', 'sample_data', foldername, file)
            let buffer = await fs.readFile(filepath);
            let fileInfo = await uploadFileToAWS(buffer, file)
            let insertQuery = `insert into ${tables.files}
            (name, file_key, file_url, file_size, property_id) 
            values('${fileInfo.fileName}','${fileInfo.filekey}','${fileInfo.fileUrl}','${fileInfo.fileSize}',${propertyId})`
            await executeQuery(insertQuery)
        }
    }
    catch (err) {
        throw err
    }
}

async function updateProviders(providers: PropertyType[], propertyId: string | number) {
    try {

        for (let provider of providers) {
            let searchQuery = `select id from ${tables.providers} where name='${provider.name}' and property_id='${propertyId}'`
            let response = await executeQuery(searchQuery)
            if (!response.length) {
                let insertQuery = `insert into ${tables.providers}
            (name, address, city, country, phone,type,zipcode,capacity,state,property_id) 
            values('${provider.name}','${provider.address}','${provider.city}','${provider.country}',
            '${provider.phone}','${provider.type}','${provider.zipcode}','${provider.capacity}','${provider.state}',${propertyId})`
                await executeQuery(insertQuery)
            }
        }
    }
    catch (err) {
        throw err
    }
}

const scrapeDataFromSources = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    let filepath = 'sample_data/Sample_Properties_Data.csv'
    var properties: any = await readFileFromCsv(filepath);

    let providers: PropertyType[] = []

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });
    const page = await browser.newPage();
    try {
        for await (let property of properties) {
            await page.goto(siteAndUrl[property.State], { waitUntil: 'networkidle2' });
            providers = await handleEdgeCases(page, property, providers)
            console.log(providers)
            let tableName = tables.properties
            let searchQuery = `select * from ${tableName} where name = '${property.Name}'`
            let response = await executeQuery(searchQuery)
            if (!response.length) {
                let insertQuery = `insert into ${tableName}
                    (name , state) values('${property.Name}','${property.State}')`
                await executeQuery(insertQuery)
                let searchQuery = `select * from ${tableName} where name = '${property.Name}'`
                response = await executeQuery(searchQuery)
                await loadImagesAndUpload(property.Name, response[0].id)
            }

            await updateProviders(providers, response[0].id)
        }

        browser.close()

        res.status(200).json({
            success: true,
            data: 'Data Scraped Successfully',
        })
    }
    catch (err) {
        browser.close()
        console.log(err)
    }


}

export default scrapeDataFromSources