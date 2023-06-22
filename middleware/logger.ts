import { NextFunction, Request, Response } from "express";

/**
* Middlewre Function for Log the request time and res time
@param req: request from client side
@param res: res which will recieve on client side
@param next: if I need to go throw any kind of function after processing  logic.
*/

const logger = (req: Request, res: Response, next: NextFunction) => {
    //middleware function
    let reqTime: any;
    let current_datetime = new Date();
    reqTime = current_datetime;
    let formatted_date =
        current_datetime.getFullYear() +
        "-" +
        (current_datetime.getMonth() + 1) +
        "-" +
        current_datetime.getDate() +
        " " +
        current_datetime.getHours() +
        ":" +
        current_datetime.getMinutes() +
        ":" +
        current_datetime.getSeconds();
    let url = req.url;
    const start = process.hrtime();
    reqTime = start;
    let log = `requesting ${url} - [${formatted_date}] `;

    console.log(log);
    let send = res.send;
    res.send = (result: any) => {
        let resTime = process.hrtime();
        let time = "";
        let seconds: number = Number(Math.round((resTime[0] * 1000 + resTime[1] / 1000000 - reqTime[0] * 1000 + reqTime[1] / 1000000) / 1000));
        if (seconds > 60) {
            let min: number = seconds / 60;
            var carrier_seconds = seconds % 60;
            time = `${min}m ${carrier_seconds}s`;
        } else {
            time = `${seconds}s`;
        }
        console.log(`Find ${req.url}: ${res.statusCode} - Response Time : ${time}`);
        console.log("Response Type :", typeof result);
        res.send = send;
        return res.send(result);
    };
    next();
};
export default logger
