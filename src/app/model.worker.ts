/// <reference lib="webworker" />

import * as base64 from "base64-arraybuffer";

addEventListener('message', ({data}) => {
  data.weightData = base64.encode(data.weightData)
  const jsonModel = JSON.stringify(data);

  postMessage(jsonModel);
});
