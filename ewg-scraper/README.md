# ewg-scraper
Script that scrapes the products from the [ewg.org](https://www.ewg.org/skindeep) website.

## Requirements
- [nodejs](https://nodejs.org/en/)

## Installation 
From the `ewg-scraper` directory run the following command to install the Javascript dependencies:
```bash
npm install
```

## Usage
```bash
node index.js <catalogue_url> <num_pages> <output_file>
```
- **catalogue_url** : the url of the catalogue containing the products.
- **num_pages**     : number of pages to scrape.
- **output_file**   : the file name where to save the result as csv.

## Example
You can see the examples in the [`commands.txt`](https://github.com/houdaaynaou/women-in-tensorflow-hackathon/blob/master/ewg-scraper/commands.txt) file
```bash
node index.js https://www.ewg.org/skindeep/browse/ingredients/705921SILICA_SILYLATE?category=foundation&id=705921SILICA_SILYLATE&per_page=36 2 good1.csv
```
The command above will produce a file named `good1.csv` in the current directory where the script was run.
