"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postMsg = exports.createThread = void 0;

require("core-js/modules/es6.regexp.to-string");

const jsonToBinArray = json => {
  const str = JSON.stringify(json, null, 0);
  const {
    length
  } = str;
  const ret = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    ret[i] = str.charCodeAt(i);
  }

  return ret;
};

const binArrayToJson = binArray => {
  const {
    length
  } = binArray;
  let str = '';

  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(Number.parseFloat(binArray[i]));
  }

  return JSON.parse(str);
};

const postBinMsg = (worker, data) => {
  const binData = jsonToBinArray(data);
  worker.postMessage(binData, [binData.buffer]);
};

const onMsg = (worker, isBinary, func) => {
  const binOnMsgF = event => {
    func(binArrayToJson(event.data));
  };

  const onMsgF = event => {
    func(event.data);
  };

  worker.onmessage = isBinary ? binOnMsgF : onMsgF;
}; // export functions


const createThread = (func, isBinary, onMsgFunc) => {
  const addEvent = "".concat(jsonToBinArray.toString()).concat(binArrayToJson.toString(), "\n  self.addEventListener('message', (event) => {\n    self.postMessage(\n      event.data instanceof Uint8Array\n        ? jsonToBinArray(").concat(func.name, "(binArrayToJson(event.data)))\n        : ").concat(func.name, "(event.data)\n    );\n  }, false);");
  const worker = new Worker(URL.createObjectURL(new Blob(["(function(){".concat("".concat(addEvent).concat(func.toString()), "})();")])));
  onMsg(worker, isBinary, onMsgFunc);
  return worker;
};

exports.createThread = createThread;

const postMsg = (worker, data, isBinary) => {
  if (isBinary) {
    postBinMsg(worker, data);
  } else {
    worker.postMessage(data);
  }
};

exports.postMsg = postMsg;