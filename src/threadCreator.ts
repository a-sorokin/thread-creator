const jsonToBinArray = (json: any): any => {
    const str = JSON.stringify(json, null, 0);
    const {length} = str;
    const ret = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        ret[i] = str.charCodeAt(i);
    }
    return ret;
};

const binArrayToJson = (binArray: any): any => {
    const {length} = binArray;
    let str = '';
    for (let i = 0; i < length; i++) {
        str += String.fromCharCode(parseFloat(binArray[i]));
    }
    return JSON.parse(str);
};

const postBinMsg = (worker: any, data: any): void => {
    const binData = jsonToBinArray(data);
    worker.postMessage(binData, [binData.buffer]);
};

const onMsg = (worker: any, isBinary: boolean, func: (any) => {}): void => {
    const binOnMsgF = (event: any): void => {
        func(binArrayToJson(event.data));
    };
    const onMsgF = (event: any): void => {
        func(event.data);
    };
    worker.onmessage = isBinary ? binOnMsgF : onMsgF;
};

// export functions

export const createThread = (func: any, isBinary: boolean, onMsgFunc: () => {}): any => {
    const addEvent = `${jsonToBinArray.toString()}${binArrayToJson.toString()}
    self.addEventListener('message', (event) => {
        self.postMessage(
        event.data instanceof Uint8Array
            ? jsonToBinArray(${func.name}(binArrayToJson(event.data)))
            : ${func.name}(event.data)
        );
    }, false);`;

    const worker = new Worker(URL.createObjectURL(
        new Blob([`(function(){${`${addEvent}${func.toString()}`}})();`])
    ));
    onMsg(worker, isBinary, onMsgFunc);
    return worker;
};

export const postMsg = (worker: any, data: any, isBinary: boolean): void => {
    if (isBinary) {
        postBinMsg(worker, data);
    } else {
        worker.postMessage(data);
    }
};
