from flask_cors import CORS
from flask import Flask
from flask_restful import Resource, Api
from flask_httpauth import HTTPBasicAuth
from resources.predict import Predict

app = Flask(__name__)
CORS(app)
api = Api(app, prefix="/api")

api.add_resource(Predict, '/predict')

if __name__ == '__main__':
  app.run(debug=True, port=5001)
