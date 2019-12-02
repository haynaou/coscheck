// External dependencies
const axios = require('axios')
const cheerio = require('cheerio')
const chalk = require('chalk')
const csv = require('fast-csv');
const ROOT_URL = "https://www.ewg.org";

// Command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(chalk.yellow(`
  Usage:

  node index.js <catalogue_url> <num_pages> <output_file>

  - catalogue_url : the url of the catalogue containing the products.
  - num_pages     : number of pages to scrape.
  - output_file   : the file name where to save the result as csv.
  `));
  
  process.exit(1)
};

const catalogueUrl = args[0];
const numPages = parseInt(args[1], 10);
const outputFile = args[2];

// Print the command line arguments passed to the script.
console.log(
  chalk.gray(`
================================================
catalogue_url: ${catalogueUrl}
num_pages    : ${numPages}
output_file  : ${outputFile}
================================================
`)
);

const getProductsUrls = (catalogueUrl, productsUrls = []) => {
  return axios.get(catalogueUrl).then(response => {
    const $ = cheerio.load(response.data);

    const listings = $("section.product-listings");
    console.log(
      chalk.yellow(`  Scraping ${listings.children().length} products`)
    );

    listings.children().each((i, el) => {
      const productUrl = $(el).find(".product-tile a").attr("href");
      if (productUrl) {
        productsUrls.push(productUrl);
      }
    });

    const path = $("a.next_page").attr('href');
    const nextPageUrl = `${ROOT_URL}/${path}`;
    return nextPageUrl;
  });
}

const getProductUrlsFromCatalogue = (
  catalogueUrl, 
  maxPages, 
  productsUrls = [], 
  scrapedPagesCount = 0) => {
  
  console.log(
    chalk.cyan(`\nScraping catalogue: ${chalk.underline.bold(catalogueUrl)}`)
  );
  scrapedPagesCount++;
  
  return getProductsUrls(catalogueUrl, productsUrls)
    .then((nextPageUrl) => {
      // Stop if we reached the max pages to be scraped.
      if (scrapedPagesCount >= maxPages) return;
    
      // Scrape next page.
      console.log(chalk.yellow(`  Scraping page ${scrapedPagesCount+1}`));
      return getProductUrlsFromCatalogue(
        nextPageUrl,
        maxPages,
        productsUrls,
        scrapedPagesCount
      );
    });
};

// convert breaklines and extra whitespace to single whitespace
// and remove whitespace from the begining and the end.
const trimSpace = (str = '') => (
  str
    .replace(/  +|[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, " ")
    .replace(/^\s+|\s+$/g, "")
)

const getAllProductsDetails = (productUrls = []) => {
  console.log(
    chalk.cyan(`\nScraping product details for ${productsUrls.length} products`)
  );
  
  const promises = productUrls.map(productUrl => getProductDetails(productUrl));
  return Promise.all(promises);
}

const getProductDetails = (productUrl) => {
  return axios.get(productUrl).then(response => {
    const $ = cheerio.load(response.data);

    // Name of the product
    const nameNode = $("#product .product-name");
    
    // Product score parsed from the score svg icon url.
    const scoreUrl = $("#product .product-score img").attr("src") || '';
    const scoreStartIndex = scoreUrl.indexOf("/score-");
    const scoreNumber = parseInt(scoreUrl.slice(scoreStartIndex + 7, scoreStartIndex + 9), 10);
    
    // Product ingredients
    const ingredientsNode = $('#label-information h3:contains("Ingredients from packaging:")').next();

    return {
      name: nameNode.text(),
      score: scoreStartIndex > 0 ? scoreNumber : 1,
      ingredients: trimSpace(ingredientsNode.text() || '')
    };
  });
}

const productsUrls = [];
getProductUrlsFromCatalogue(catalogueUrl, numPages, productsUrls)
  .then(() => {
    return getAllProductsDetails(productsUrls)
      .then((productDetails) => {
        console.log(chalk.cyan(`Saving ${productsUrls.length} products to ${outputFile}.`));
        csv.writeToPath(outputFile, productDetails, { headers: true });
      });
  })
  .catch(error => {
    console.log(chalk.red(`${error}`));
  
    if (error.response) {
      console.log(chalk.red(`
response status: ${error.response.status}
response headers: ${JSON.stringify(error.response.headers, null, " ")}
      `));
    }
  });
