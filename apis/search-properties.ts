import { Request, Response } from "express";
import { executeQuery, tables } from "../common/common";

/**
* API Function for SEARCH properties from db
@param req: request from client side
@param res: res which will recieve on client side
@param next: if I need to go throw any kind of function after processing business logic.
*/

const searchPropertiesApi = async (req: Request, res: Response) => {
    try {
        let { searchString } = req.body
        let searchQuery = `select * from ${tables.providers} 
            where 
            LOWER(name) like '%${searchString}%' or 
            LOWER(state) like '%${searchString}%' or
            LOWER(city) like '%${searchString}%'`
        let properties = await executeQuery(searchQuery)
        if (properties.length) {
            for (let property of properties) {
                let imageSearchQuery = `select file_url, file_key from ${tables.files} where property_id = ${property.property_id}`
                let images = await executeQuery(imageSearchQuery)
                property.images = images
            }
        }
        res.status(200).json({
            success: true,
            data: properties
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            data: []
        })
    }

}
export default searchPropertiesApi