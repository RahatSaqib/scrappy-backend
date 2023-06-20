import db from '../config/connectToDatabase'
import puppeteer from 'puppeteer'
import axios from "axios";
import cheerio from 'cheerio'
import fs from 'fs';
import csv from "csv-parser";
import dbTables from './db-tables';
const dbName = process.env.DB_DATABASE

export const tables: any = {
    properties: "properties",
    providers: "providers",
    files: "files",
}

const createTableQuery: any = {
    [tables['properties']]: dbTables.createPropertyTable,
    [tables['providers']]: dbTables.createProvidersTable,
    [tables['files']]: dbTables.createFilesTable,
}

export const isValidImageOrMarker = (fileName: string) => {
    if (!fileName) {
        return false
    }
    if (fileName == '' || fileName.toLowerCase() == 'n/a') {
        return false
    }
    else {
        return true
    }
}
export const isValidValueOrKey = (value: any) => {
    if (!value || value == '' || value?.toLowerCase() == 'n/a') {
        return false
    }
    else {
        return true
    }
}
export const log = (message = '', value = '') => {
    if (value == '') return console.log(message)
    return console.log(message, value)
}


export const getTableNameFromSql = async (sql: any) => {
    let matchIndex = sql.match(/scrappy_db/i).index
    let tableName = sql.slice(matchIndex, sql.length).split(/[\s]+/)[0]
    return tableName
}
export const getColumnNameFromSql = async (message: any) => {
    let matchIndex = message.match(/'/i).index
    let columnName = message.slice(matchIndex, message.length).split(/[\s]+/)[0].replaceAll("'", '')
    return columnName
}

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
const processTableName = async (name: string) => {
    let splittedName = name.split(/[\s-&]+/)
    let joinedName = splittedName.join('')
    const table = dbName + '_' + joinedName.toLowerCase()
    return table
}
export const returnValidJson = async (data: any) => {
    if (!data) {
        return {}
    }
    if (typeof data == 'string') {
        if (data == 'undefined' || data == "" || data.toLowerCase() == "n/a") {
            return {}
        }
        else {
            let parsedData = JSON.parse(data)
            return parsedData
        }
    }
    else if (typeof data == 'object') {
        return data
    }
    else {
        return {}
    }

}
export const getTable = async (type: any) => {
    const table = await processTableName(type)
    let query = `SELECT * FROM  ${table}`
    let res = await executeQuery(query)
    return table

}
// export const puppeteerResponse = async (url: string) => {
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: 'networkidle2' });
//     return page
// }

export const getElementFromUrl = async (url: string) => {
    const { data } = await axios({
        method: "GET",
        url: url,
    });
    const $ = cheerio.load(data);
    return $
}

export const siteAndUrl: any = {
    Texas: 'https://apps.hhs.texas.gov/LTCSearch/namesearch.cfm',
    Florida: "https://www.floridahealthfinder.gov/facilitylocator/FacilitySearch.aspx"
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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




