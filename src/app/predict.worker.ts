/// <reference lib="webworker" />

import {GraphModel, Tensor2D, Tensor4D} from "@tensorflow/tfjs";
import * as base64 from "base64-arraybuffer";
import {SerializedTensor} from "./serialized-tensor";

function deserializeModel(serializedModel: string): GraphModel {
  const artifacts = JSON.parse(serializedModel);
  artifacts.weightData = base64.decode(artifacts.weightData);
  const model = new GraphModel({});
  model.loadSync(artifacts);
  return model;
}

addEventListener('message', ({data}) => {
    const model = deserializeModel(data.serializedModel);
    const tensor: Tensor4D = SerializedTensor.deserialize(data.serializedTensor);
    const predictions = model.predict(tensor) as Tensor2D;
    postMessage(new SerializedTensor(predictions));
  }
);
