import ErrorHandler from "./errorHandler";
import { NextFunction, Request, Response } from "express";

const handler = (err: any, req: Request, res: Response, next: NextFunction) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error!";

    // Wrong Mongodb error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400)
    }

    // MONGOOSE DUPLICATE KEY ERROR
    if (err.code === 11000) {

        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`
        err = new ErrorHandler(message, 400)
    }


    res.status(err.statusCode).json({
        success: false,
        error: err.message
        // error: err.stack
    })
}
export default handler