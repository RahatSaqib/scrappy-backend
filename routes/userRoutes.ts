
import express, { Router } from "express";
import scrapeDataFromSources from "../apis/scrape-data-from-sources";

const router: Router = express.Router();

// creat a admin
router.post("/scrape-data-from-sources", scrapeDataFromSources);


export default router;
