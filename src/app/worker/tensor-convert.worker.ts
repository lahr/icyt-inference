/// <reference lib="webworker" />

import TiffIfd from "tiff/lib/tiffIfd";
import * as tiff from "tiff";
import * as tf from "@tensorflow/tfjs";
import {Tensor2D, Tensor3D} from "@tensorflow/tfjs";
import {SerializedTensor} from "../domain/serialized-tensor";

const MEANS = new Map([
  [1, 730.3922394],
  [2, 27.48605007],
  [3, 35.80782804],
  [4, 38.69671402],
  [5, 38.93128954],
  [6, 203.9679429],
  [9, 750.21572735]
]);
const STDDEVS = new Map([
  [1, 138.04682471],
  [2, 44.22355082],
  [3, 10.76810093],
  [4, 13.24520283],
  [5, 13.94946564],
  [6, 428.20343978],
  [9, 117.98273764]
]);

function standardize(tensor: Tensor3D): Tensor3D {
  return tf.stack(tensor.unstack(-1).map((slice, i) => {
    const channel = i + 1;
    if (MEANS.get(channel) === undefined || STDDEVS.get(channel) === undefined) return slice;
    return slice.sub(MEANS.get(channel)!).div(STDDEVS.get(channel)!);
  }), -1) as Tensor3D;
}

function normalize(tensor: Tensor3D): Tensor3D {
  return tf.stack(tensor.unstack(-1).map(channel => {
    const numerator = channel.sub(channel.min());
    const denominator = channel.max().sub(channel.min());
    const c: Tensor2D = numerator.divNoNan(denominator);
    return c;
  }), -1) as Tensor3D;
}

addEventListener('message', ({data}) => {
  const image: TiffIfd = tiff.decode(data)[0];
  const shape: [number, number, number] = [image.height, image.width, image.get('SamplesPerPixel')];
  let tensor: Tensor3D = tf.tensor3d(Array.from(image.data), shape, 'float32')
  tensor = standardize(tensor);
  tensor = normalize(tensor);
  postMessage(new SerializedTensor(tensor));
});
