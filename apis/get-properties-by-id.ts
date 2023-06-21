import { Request, Response } from "express";
import { executeQuery, tables } from "../common/common";


const getPropertiesByIDApi = async (req: Request, res: Response) => {
    try {
        let { id } = req.body
        let searchQuery = `select * from ${tables.providers} 
            where 
            id=${id}`
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
        console.log(err)
        res.status(500).json({
            success: false,
            data: []
        })
    }

}
export default getPropertiesByIDApi