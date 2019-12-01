import os
import logging
import pickle
import tensorflow as tf
from flask_restful import Resource, reqparse
from flask_httpauth import HTTPBasicAuth
auth = HTTPBasicAuth()

# Disable logging
logging.disable(logging.WARNING)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)

MODEL_PATH = os.path.join(os.getcwd(), 'tf_model.h5')
TOKENIZER_PATH = os.path.join(os.getcwd(), 'tokenizer.pickle')

USER_DATA = {
  "admin": "admin"
}

def load_tokenizer():
  with open(TOKENIZER_PATH, 'rb') as handle:
    tokenizer = pickle.load(handle)
    return tokenizer

def prepare_input_text(text):
  tokeniser = load_tokenizer()
  tokenized = tokeniser.texts_to_sequences(text)
  padded = tf.keras.preprocessing.sequence.pad_sequences(tokenized)
  return padded

def predict(input_text):
  new_model = tf.keras.models.load_model(MODEL_PATH)
  prediction = new_model.predict_classes(prepare_input_text([input_text]))
  return prediction[0]

@auth.verify_password
def verify(username, password):
  if not (username and password):
    return False
  return USER_DATA.get(username) == password

class Predict(Resource):
  def get(self):
    return {"message": "Coscheck Prediction API"}

  @auth.login_required
  def post(self):
    parser = reqparse.RequestParser()
    parser.add_argument('text')
    args = parser.parse_args()

    input_text = args['text']
    if len(str(input_text)) <= 5:
      return {'error': 'input text too small'}, 400

    prediction = predict(input_text)
    print("prediction=", prediction)
    return {'prediction': int(prediction)}, 201

