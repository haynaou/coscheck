# coscheck-prediction
Backend server that performs the model prediction on the text passed as a POST request.

## Requirements
- [Python 3.7.4](https://www.python.org/downloads/release/python-374/)
- [Tensorflow](https://www.tensorflow.org/install/pip)

## Installation 
From the `coscheck-prediction` directory run the following command to install the Python dependencies:
```bash
pip install
```

## Usage
Start the server:

```bash
python3 app.py
```
and now the server should be running at http://localhost:5001

## Example
Here's an example on how to call the `/api/predict` endpoint with the following ingredients text: 
```
WATER, SODIUM LAURETH SULFATE, COCAMIDOPROPYL BETAINE*, SODIUM CHLORIDE, CANANGA ODORATA FLOWER OIL
```

```bash
curl -X POST -u 'admin:admin' \
  -H "Content-Type: application/json" \
  -d '{"text": "WATER, SODIUM LAURETH SULFATE, COCAMIDOPROPYL BETAINE*, SODIUM CHLORIDE, CANANGA ODORATA FLOWER OIL"}' \
  http://localhost:5001/api/predict
```
The command above will send the product ingredients text to the server and the server will respond back with the following prediction:
```js
{
  "prediction": 1
}
```
### Prediction interpretation:

- **0**: High hazard concern
- **1**: Moderate hazard concern
- **2**: Low hazard concern
