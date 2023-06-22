## Getting Started

First, install the packages:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Project Demo : [Live Link](http://3.219.85.76/)

API Routes : 
1. POST: /api/v1/scrape-data-from-sources , body: {}
2. POST: /api/v1/get-properties-by-id , body: { id: 5}
3. POST: /api/v1/search-properties , body: { searchString: 'legacy'}

Technology/Tools Used in this project:
1. [Node](https://react.dev/](https://nodejs.org/en): For runtime environment
2. [Typescript](https://www.typescriptlang.org/):  As a programming language
3. [Express](https://expressjs.com/en/starter/installing.html): A Node js framework for handle REST api easily
4. [puppeteer](https://pptr.dev/): Library for handling chrome browser automated away
5. [cheerio](https://cheerio.js.org/): For reading html element scrapped by puppeteer
6. [csv-parser](https://www.npmjs.com/package/csv-parser): For Parsing csv files as a object
7. [AWS-S3-Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/): For storing images to AWS S3 bucket
8. [MySql](https://dev.mysql.com/doc/) : For storing information to db

