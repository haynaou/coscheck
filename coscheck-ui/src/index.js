import React, { Component  } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Dropzone from "react-dropzone";
import _ from 'lodash';
import './assets/main.css';
import Loader from './components/Loader';
import GaugeChart from 'react-gauge-chart';

const ping = (url, name) => {
  const t0 = performance.now();
  return axios.get(url).then(() => {
    const t1 = performance.now();
    return `${url} API ping successfull after ${parseFloat(t1 - t0).toFixed(2)}ms`;
  });
}

const isProd = process.env.NODE_ENV === 'production';
const OCR_API_BASE_URL = isProd ? "https://coscheck-ocr.herokuapp.com" : "http://localhost:5000";
const PREDICTION_API_BASE_URL = isProd ? "https://coscheck-prediction.herokuapp.com" : "http://localhost:5001";
const MAX_SIZE = 5 * 1024 * 1024; // 5mb

console.info('env', process.env)

class App extends Component {
  state = {
    activeTab: "upload",
    prediction: null,
    uploadRejected: null,
    uploaded: null,
    text: "",
    error: null,
    parsedText: null,
    clickedAnalyze: false,
    loading: false,
    showModal: false
  };

  componentDidMount = () => {
    Promise.all([
      ping(`${OCR_API_BASE_URL}/api`, "ocr"),
      ping(`${PREDICTION_API_BASE_URL}/api/predict`, "prediction")
    ])
      .then(messages => {
        console.info(messages[0]);
        console.info(messages[1]);
      })
      .catch(error => {
        console.error("Ping error:", error);
      });
  };

  toggleTab = tab => {
    if (_.includes(["upload", "text"], tab) && tab !== this.state.activeTab) {
      this.setState({ activeTab: tab });
    }
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length) {
      this.setState({ uploadRejected: rejectedFiles[0] });
      return;
    } else {
      this.setState({ uploadRejected: rejectedFiles[0] });
    }

    if (acceptedFiles.length) {
      const file = acceptedFiles[0];
      file.preview = URL.createObjectURL(file);
      this.setState({
        uploaded: file
      });
    }
  };

  onTextareaChange = e => {
    const { value } = e.target;
    this.setState({
      text: value
    });
  };

  onTry = () => {
    this.setState({
      prediction: null,
      activeTab: "upload",
      fileRejected: false,
      uploaded: null,
      text: "",
      error: null,
      parsedText: null,
      clickedAnalyze: false,
      loading: false
    });
  };

  predit = text => {
    const config = {
      auth: {
        username: "admin",
        password: "admin"
      }
    };

    this.setState({ loading: true });
    axios
      .post(`${PREDICTION_API_BASE_URL}/api/predict`, { text }, config)
      .then(response => {
        this.setState({
          loading: false,
          prediction: _.get(response, "data.prediction", ""),
          error: null
        });
      })
      .catch(error => {
        console.error("error:", error);
        this.setState({
          loading: false,
          error: _.get(
            error,
            "response.data.error",
            error ? error.message : `Error happened`
          ),
          prediction: null
        });
      });
  };

  onAnalyze = () => {
    const { uploaded, text } = this.state;
    this.setState({
      clickedAnalyze: true,
      loading: true
    });

    if (!uploaded) {
      this.setState(
        {
          parsedText: text,
          text: "",
          loading: false
        },
        () => {
          this.predit(text);
        }
      );
      return;
    }

    const config = {
      headers: { "Content-Type": "multipart/form-data" }
    };

    let fd = new FormData();
    fd.append("image", uploaded);

    axios
      .post(`${OCR_API_BASE_URL}/api/parse-image`, fd, config)
      .then(response => {
        this.setState(
          {
            loading: false,
            parsedText: _.get(response, "data.result", ""),
            uploaded: null,
            error: null
          },
          () => {
            if (!_.isEmpty(_.trim(this.state.parsedText))) {
              this.predit(this.state.parsedText);
            }
          }
        );
      })
      .catch(error => {
        console.error("error:", error);
        this.setState({
          loading: false,
          error: error ? error.message : `Error happened`,
          uploaded: null,
          parsedText: null
        });
      });
  };

  renderTabs = () => {
    const t = this.state.activeTab;

    return (
      <div className="flex justify-center items-center mt-8">
        <div
          onClick={() => this.toggleTab("upload")}
          className={`bg-white cursor-pointer rounded bg-white border-4 rounded flex-1 mr-4 py-4 px-5 border-${
            t === "upload" ? "pink" : "gray"
          }-300`}
        >
          <div className="flex flex-col items-center justify-center">
            <i className="eva eva-camera-outline text-4xl mr-5 text-gray-500" />
            <div
              className={`font-bold text-xl mt-3 text-gray-${
                t === "upload" ? "900" : "500"
              }`}
            >
              Upload Ingredients Photo 👇
            </div>
          </div>
        </div>
        <div
          className={`bg-white cursor-pointer rounded bg-white border-4 rounded flex-1 py-4 px-5 border-${
            t === "text" ? "pink" : "gray"
          }-300`}
        >
          <div
            onClick={() => this.toggleTab("text")}
            className="flex flex-col items-center justify-center"
          >
            <i className="eva eva-file-text-outline text-4xl mr-5 text-gray-500" />
            <div
              className={`font-bold text-xl mt-3 text-gray-${
                t === "text" ? "900" : "500"
              }`}
            >
              Paste Ingredients Text 👇
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderTabContent = () => {
    const { activeTab, uploaded, text, uploadRejected } = this.state;
    if (activeTab === "text") {
      return (
        <div style={{ height: "21.06rem" }}>
          <textarea
            placeholder="Paste product ingredients here"
            className="bg-gray-100 textarea focus:outline-none p-6 text-lg rounded"
            name="tt"
            onChange={this.onTextareaChange}
            value={text}
          ></textarea>
        </div>
      );
    }

    if (uploaded) {
      return (
        <div className="p-6 flex justify-center">
          <img className="object-contain h-64" src={uploaded.preview} alt="" />
        </div>
      );
    }
    return (
      <div className="p-6">
        <Dropzone
          maxSize={MAX_SIZE}
          accept="image/png,image/jpg,image/jpeg"
          onDrop={this.onDrop}
        >
          {({
            getRootProps,
            getInputProps,
            isDragActive,
            isDragReject,
            rejectedFiles
          }) => {
            const isFileTooLarge =
              rejectedFiles.length > 0 && rejectedFiles[0].size > MAX_SIZE;

            const showMessage = (fileReject, isFileTooLarge) => {
              if (fileReject) {
                const filename = _.get(fileReject, "name", null);
                return (
                  <div className="text-red-600 text-xl mt-4">
                    File type not accepted
                    {filename ? (
                      <span className="font-bold">{" " + filename}</span>
                    ) : (
                      ""
                    )}
                    , sorry! <br />
                    We only accept images of type png or jpeg
                  </div>
                );
              }
              if (isFileTooLarge) {
                return (
                  <div className="text-red-600 text-xl mt-4">
                    Image too large, try an image less than 5mb.
                  </div>
                );
              }
              return (
                <div>
                  <i className="eva eva-cloud-upload-outline text-6xl text-gray-400" />
                  <p className="text-gray-600 text-lg">
                    Drop files here or click to upload
                  </p>
                </div>
              );
            };

            return (
              <section>
                <div
                  className="border border-dashed border-gray-400 cursor-pointer bg-gray-100 w-full py-24 text-center"
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  {showMessage(isDragReject || uploadRejected, isFileTooLarge)}
                </div>
              </section>
            );
          }}
        </Dropzone>
      </div>
    );
  };

  renderContent = () => {
    const { loading, parsedText } = this.state;
    return (
      <Loader
        loading={loading}
        render={() => {
          if (!_.isNil(parsedText)) {
            return (
              <div className="w-full px-6 lg:w-1/2 mx-auto">
                <div className="border-4 border-gray-300 mt-4">
                  <div className="p-6 flex justify-center">
                    <div className="text-xl text-pink-700 leading-relaxed">
                      {_.isEmpty(_.trim(parsedText)) ? (
                        <div className="bg-yellow-200 rounded-lg px-6 py-4 flex items-start">
                          <i className="eva eva-alert-triangle-outline text-3xl pt-1 text-yellow-600 mr-4" />
                          <p className="text-yellow-700">
                            No text was extracted from the uploaded image,
                            please try another image or use the text input.
                          </p>
                        </div>
                      ) : (
                        <div>{parsedText}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="w-full px-6 lg:w-1/2 mx-auto">
              {this.renderTabs()}
              <div className="border-4 border-gray-300 mt-4">
                {this.renderTabContent()}
              </div>
            </div>
          );
        }}
      />
    );
  };

  renderActionButton = () => {
    const { uploaded, text, parsedText, clickedAnalyze } = this.state;
    if ((!_.isNil(uploaded) || !_.isEmpty(text)) && !clickedAnalyze) {
      return (
        <div className="flex justify-center items-center mt-12">
          <p
            onClick={this.onAnalyze}
            style={{ transition: "all 0.8s" }}
            className="cursor-pointer hover:bg-pink-400 shadow font-bold bg-pink-300 text-2xl px-6 p-4 rounded-full"
          >
            Analyze <span role="img">🔮</span>
          </p>
        </div>
      );
    }

    if (clickedAnalyze) {
      return (
        <div className="flex justify-center h-32 items-center mt-12">
          <p
            onClick={this.onTry}
            style={{ transition: "all 0.8s" }}
            className="cursor-pointer hover:bg-gray-400 shadow font-bold bg-gray-300 text-2xl px-6 p-4 rounded-full"
          >
            Try Again <span role="img">🔁</span>
          </p>
        </div>
      );
    }
  };

  renderPrediction = () => {
    const { prediction, error } = this.state;
    let text = null;
    let chartPercent = null;
    if (error) {
      return (
        <div className="w-full px-6 lg:w-1/2 mx-auto text-center my-8">
          <div className="bg-yellow-200 rounded-lg px-6 py-4 flex items-start">
            <i className="eva eva-alert-triangle-outline text-3xl pt-1 text-yellow-600 mr-4" />
            <p className="text-yellow-700 text-2xl">{error}</p>
          </div>
        </div>
      );
    }

    if (!_.isNumber(prediction)) return;

    switch (prediction) {
      case 0:
        chartPercent = 0.2;
        text = (
          <div className="text-3xl">
            This product has a{" "}
            <span className="text-red-500 font-bold">high</span> hazard concern
          </div>
        );
        break;
      case 1:
        chartPercent = 0.55;
        text = (
          <div className="text-3xl">
            This product has a{" "}
            <span className="text-yellow-400 font-bold">moderate</span> hazard
            concern
          </div>
        );
        break;
      case 2:
        chartPercent = 0.85;
        text = (
          <div className="text-3xl">
            This product has a{" "}
            <span className="text-green-500 font-bold">low</span> hazard concern
          </div>
        );
        break;
      default:
    }

    return (
      <div className="w-full px-6 lg:w-1/2 mx-auto text-center my-8">
        <div className="flex justify-center p-10">
          <GaugeChart
            style={{ height: "100%" }}
            id="gauge-chart1"
            colors={["#e53e3e", "#ecc94b", "#38a169"]}
            nrOfLevels={3}
            hideText
            percent={chartPercent}
          />
        </div>
        {text}
      </div>
    );
  };

  render = () => {
    return (
      <div className="mb-32 lg:mb-64">
        <div className="hero text-center text-gray-900">
          <h1 className="text-3xl font-bold lg:text-6xl logo pt-10 lg:pt-40 mb-4">
            Cosmetic Product Classifier <span role="img">💅</span>
          </h1>
          <p className="px-10 text-center text-md lg:text-2xl w-50 text-gray-700 mb-10 lg:mb-20">
            You don't have to memorize every product ingredients anymore, <br />
            you can use our smart classification algorithm to know if a product is
            harmful or not.
          </p>

          <div className="mt-0 hidden md:block mb-12">
            <p className="font-bold text-gray-700 text-lg lg:text-xl rounded-full">
              Try it now!
            </p>
            <i className="eva eva-arrow-ios-downward-outline text-2xl text-gray-400" />
          </div>
        </div>

        {this.renderPrediction()}

        {this.renderContent()}

        {this.renderActionButton()}

		<div className="flex justify-center mt-20 text-gray-400">
			Made by&nbsp;<a className="hover:font-bold" href="https://houdaaynaou.com/articles/women-in-tensorflow-hackathon/"> Houda Aynaou</a>
		</div>
      </div>
    );
  };
}

ReactDOM.render(<App />, document.getElementById('root'));
