// @flow

const jsonToBinArray = (json: JSON): * => {
    const str = JSON.stringify(json, null, 0);
    const {length} = str;
    const ret = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        ret[i] = str.charCodeAt(i);
    }
    return ret;
};

const binArrayToJson = (binArray: *): JSON => {
    const {length} = binArray;
    let str = '';
    for (let i = 0; i < length; i++) {
        str += String.fromCharCode(Number.parseFloat(binArray[i]));
    }
    return JSON.parse(str);
};

const postBinMsg = (worker: *, data: *): void => {
    const binData = jsonToBinArray(data);
    worker.postMessage(binData, [binData.buffer]);
};

const onMsg = (worker: *, isBinary: boolean, func: (*) => {}): void => {
    const binOnMsgF = (event: *): void => {
        func(binArrayToJson(event.data));
    };
    const onMsgF = (event: *): void => {
        func(event.data);
    };
    worker.onmessage = isBinary ? binOnMsgF : onMsgF;
};

// export functions

export const createThread = (func: (*) => {}, isBinary: boolean, onMsgFunc: () => {}): {} => {
    const addEvent = `${jsonToBinArray.toString()}${binArrayToJson.toString()}
  self.addEventListener('message', (event) => {
    self.postMessage(
      event.data instanceof Uint8Array
        ? jsonToBinArray(${func.name}(binArrayToJson(event.data)))
        : ${func.name}(event.data)
    );
  }, false);`;

    const worker = new Worker(URL.createObjectURL(new Blob([`(function(){${`${addEvent}${func.toString()}`}})();`])));
    onMsg(worker, isBinary, onMsgFunc);
    return worker;
};

export const postMsg = (worker: *, data: *, isBinary: boolean): void => {
    if (isBinary) {
        postBinMsg(worker, data);
    } else {
        worker.postMessage(data);
    }
};
