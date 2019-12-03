# coscheck-backend
Backend server that performs the OCR on the image passed-in as a POST request.

## Requirements
- [nodejs](https://nodejs.org/en/)

## Installation 
From the `coscheck-backend` directory run the following command to install the Javascript dependencies:
```bash
npm install
```

## Usage
Start the server:

```bash
npm run start
```
and now the server should be running at http://localhost:5000

## Example
Here's an example on how to call the `/api/ocr/parse-image` endpoint with the [demo.jpg](https://github.com/houdaaynaou/women-in-tensorflow-hackathon/blob/master/coscheck-backend/demo.jpg)

```bash
curl -X POST -F 'image=@demo.jpg' http://localhost:5000/api/ocr/parse-image
```
The command above will send an image to the server and the server will respond back with the text
```js
{
   "result": "i ee sea oe oe INGREDIENTS: WATER (AQUA), SODIUM LAURETH SULFATE, COCAMIDOPROPYL BETAINE*, SODIUM CHLORIDE, CANANGA ODORATA FLOWER OIL*, COCOS NUCIFERA (COCONUT) OIL*, FRAGRANCE (PARFUM), SODIUM BENZOATE, GLYCOL DISTEARATE, CITRIC ACID, POLYQUATERNIUM-10, COCAMIDE et MEA, PPG-9, DISODIUM EDTA, BENZYL ALCOHOL, BENZYL SALICYLATE, LIMONENE, LINALOOL *PLANT BASED INGREDIENTS"
}
```
