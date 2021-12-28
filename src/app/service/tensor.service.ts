import {Injectable} from '@angular/core';
import {browser, Tensor3D, Tensor4D} from "@tensorflow/tfjs";
import {SerializedTensor} from "../domain/serialized-tensor";

@Injectable({
  providedIn: 'root'
})
export class TensorService {

  private numChannels: number = 0;
  private tensors: Tensor3D[] = [];

  constructor() {
  }

  private static tiffToTensor(imageBuffer: ArrayBuffer): Promise<Tensor3D> {
    const worker = new Worker(new URL('../worker/tensor-convert.worker', import.meta.url));
    const result = new Promise<Tensor3D>((resolve, reject) => {
      worker.onmessage = ({data}) => resolve(SerializedTensor.deserialize(data));
      worker.onerror = (e: ErrorEvent) => {
        e.preventDefault();
        reject(new Error(e.message));
      };
    });

    worker.postMessage(imageBuffer);
    return result;
  }

  async initializeTensors(imageBuffers: ArrayBuffer[]): Promise<number> {
    this.tensors = await Promise.all(imageBuffers.map(imageBuffer => TensorService.tiffToTensor(imageBuffer)));
    this.numChannels = this.tensors.flatMap((tensor: Tensor3D) => tensor.shape[2]).reduce((p: number, c: number) => {
      if (p != c) throw new Error(`Different channel numbers ${p} and ${c}.`);
      return c;
    });
    return this.numChannels;
  }

  convertToImageData(channelNr: number): Promise<ImageData>[] {
    return this.tensors.map(tensor => {
      const channel = tensor.slice([0, 0, channelNr - 1], [tensor.shape[0], tensor.shape[1], 1]);
      return browser.toPixels(channel)
        .then(bytes => {
          const [height, width] = channel.shape.slice(0, 2);
          return new ImageData(bytes, width, height);
        });
    });
  }

  convertToPredictTensors(selectedChannels: number[]): Promise<Tensor4D> {
    const worker = new Worker(new URL('../worker/tensor-predict.worker', import.meta.url));
    const result = new Promise<Tensor4D>((resolve, reject) => {
      worker.onmessage = ({data}) => resolve(SerializedTensor.deserialize(data));
      worker.onerror = (e: ErrorEvent) => {
        e.preventDefault();
        reject(new Error(e.message));
      };
    }).finally(() => worker.terminate());
    worker.postMessage({
      tensors: this.tensors.map(tensor => new SerializedTensor(tensor)),
      selectedChannels: selectedChannels,
    });
    return result;
  }
}
