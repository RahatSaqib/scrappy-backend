
import errorMiddleware from "./middleware/error";
import logger from "./middleware/logger";
import path from 'path';
import bodyParser from "body-parser"
import express, { Express } from 'express';
import cors from 'cors'
import userRoutes from './routes/userRoutes'

const app: Express = express();
// app.use(express.json());
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true, parameterLimit: 10000000 }))
app.use(express.json({ limit: '100mb' }));
app.use(logger);


// import routes
let dir = path.join(__dirname, "uploads").replace("server", "public")

// route 
app.use("/api/v1", userRoutes);
app.use("/api/v1/uploads", express.static(dir));

// Middleware for error
app.use(errorMiddleware);


export default app;