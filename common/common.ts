import db from '../config/connectToDatabase'
import puppeteer from 'puppeteer'
import cheerio from 'cheerio'
import fs from 'fs';
import csv from "csv-parser";
import dbTables from './db-tables';

/**
 * Object for data sources which need to scrape
 */

export const siteAndUrl: any = {
    Texas: 'https://apps.hhs.texas.gov/LTCSearch/namesearch.cfm',
    Florida: "https://www.floridahealthfinder.gov/facilitylocator/FacilitySearch.aspx"
}

/**
 * Object for Table names from db
 */

export const tables: any = {
    properties: "properties",
    providers: "providers",
    files: "files",
}

/**
 * Object for Creating Table based on the table name
 */

const createTableQuery: any = {
    [tables['properties']]: dbTables.createPropertyTable,
    [tables['providers']]: dbTables.createProvidersTable,
    [tables['files']]: dbTables.createFilesTable,
}

/**
 * Function for getting Table name from SQL Query
 * @param sql : sql string with table name
 */

export const getTableNameFromSql = async (sql: any) => {
    let matchIndex = sql.match(/scrappy_db/i).index
    let tableName = sql.slice(matchIndex, sql.length).split(/[\s]+/)[0]
    return tableName
}

/**
 * Function for getting column name from SQL Query
 * @param message :erro message from sql
 */

export const getColumnNameFromSql = async (message: any) => {
    let matchIndex = message.match(/'/i).index
    let columnName = message.slice(matchIndex, message.length).split(/[\s]+/)[0].replaceAll("'", '')
    return columnName
}

/**
 * Function for executing SQL query
 * @param query :The query you want to run
 */

export const executeQuery = async (query: string) => {
    let res = await db.query(query).catch(async (err: any) => {
        if (err) {
            console.log(err)
            // if (err.code === 'ER_NO_SUCH_TABLE') {
            //     let tableName = await getTableNameFromSql(err.sql)
            //     // await createQueryForSpecies(tableName)
            //     let response: any = await executeQuery(query)
            //     return response
            // }
            // else
            if (err.sqlMessage.match('Unknown column')) {
                let tableName = await getTableNameFromSql(err.sql)
                let columnName = await getColumnNameFromSql(err.sqlMessage)
                console.log(columnName)

                let columnQuery = `ALTER table ${tableName} add column (${columnName} longtext);`
                await executeQuery(columnQuery)
                let res: any = await executeQuery(query)

                return res;
            }
            else {
                return err
                // console.log({res})
            }
        }
    })
    return res?.length > 0 ? res[0] : []
}



// export const puppeteerResponse = async (url: string) => {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });
//     return page
// }

/**
 * Function for get external url informations
 * @param url : Url that needs to scrap
 */

export const getElementFromUrl = async (url: string) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    await page.waitForSelector('.main-content')
    const content = await page.content()
    const $ = cheerio.load(content)
    await browser.close()
    return $
}


/**
 * Function for wait process by specific time
 * @param ms : time you need to wait
 */

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Function for reading file from csv
 * @param filepath : path of csv file
 */

export const readFileFromCsv = async (filepath: string) => {
    var csvData: any = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filepath)
            .pipe(csv())
            .on('data', function (csvrow) {
                //do something with csvrow
                csvData.push(csvrow);
            })
            .on('end', function () {
                //do something with csvData
                resolve(csvData)
            });
    })
}

/**
 * Function for creating db tables if not exists
 */

export const checkTableExistOrNot = async () => {
    for (let table in tables) {
        let query = `SHOW TABLES LIKE '${tables[table]}';`
        let res = await executeQuery(query)
        if (!res.length) {
            let createQuery = createTableQuery[tables[table]]
            let res = await executeQuery(createQuery)
        }
    }
}




