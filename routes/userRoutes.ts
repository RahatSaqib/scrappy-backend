
import express, { Router } from "express";
import scrapeDataFromSources from "../apis/scrape-data-from-sources";
import searchPropertiesApi from "../apis/search-properties";
import getPropertiesByIDApi from "../apis/get-properties-by-id";

const router: Router = express.Router();

// creat a admin
router.post("/scrape-data-from-sources", scrapeDataFromSources);
router.post("/search-properties", searchPropertiesApi);
router.post("/get-properties-by-id", getPropertiesByIDApi);


export default router;
