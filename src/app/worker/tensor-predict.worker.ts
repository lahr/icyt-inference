/// <reference lib="webworker" />

import {image, stack, Tensor3D, Tensor4D} from "@tensorflow/tfjs";
import {SerializedTensor} from "../domain/serialized-tensor";

const [height, width] = [224, 224];

addEventListener('message', ({data}) => {
  if (data.selectedChannels === undefined || data.selectedChannels.length === 0) {
    throw new Error('selectedChannels must not be empty')
  }
  const selectedChannels: number[] = data.selectedChannels;
  const tensors: Tensor3D[] = data.tensors.map((serializedTensor: any) => SerializedTensor.deserialize(serializedTensor));

  const predictionTensor: Tensor4D = stack(tensors
    .map(tensor =>
      stack(tensor.unstack(-1).filter((slice, i) =>
        selectedChannels.includes(i + 1)
      ), -1) as Tensor3D
    )
    .map((tensor: Tensor3D) => image.resizeBilinear(tensor, [height, width]))) as Tensor4D;

  postMessage(new SerializedTensor(predictionTensor));
});
