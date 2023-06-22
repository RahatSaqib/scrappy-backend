
import express, { Router } from "express";
import scrapeDataFromSources from "../apis/scrape-data-from-sources";
import searchPropertiesApi from "../apis/search-properties";
import getPropertiesByIDApi from "../apis/get-properties-by-id";

const router: Router = express.Router();

// Routes from Scrape data from sources
router.post("/scrape-data-from-sources", scrapeDataFromSources);

// Routes from Search Properties
router.post("/search-properties", searchPropertiesApi);

// Routes from Search Properties by ID
router.post("/get-properties-by-id", getPropertiesByIDApi);


export default router;
