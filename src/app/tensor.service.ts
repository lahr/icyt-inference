import {Injectable} from '@angular/core';
import {browser, tensor3d, Tensor3D} from "@tensorflow/tfjs";

@Injectable({
  providedIn: 'root'
})
export class TensorService {

  private numChannels: number = 0;
  private _tensors: Tensor3D[] = [];

  constructor() {
  }

  get tensors(): Tensor3D[] {
    return this._tensors;
  }

  private static tiffToTensor(imageBuffer: ArrayBuffer): Promise<Tensor3D> {
    const worker = new Worker(new URL('./tensor.worker', import.meta.url));
    const result = new Promise<Tensor3D>(resolve => worker.onmessage = ({data}) => {
      resolve(tensor3d(data[0], data[1]));
    });
    worker.postMessage(imageBuffer);
    return result;
  }

  async initializeTensors(imageBuffers: ArrayBuffer[]): Promise<number> {
    this._tensors = await Promise.all(imageBuffers.map(imageBuffer => TensorService.tiffToTensor(imageBuffer)));
    this.numChannels = this._tensors.flatMap((tensor: Tensor3D) => tensor.shape[2]).reduce((p: number, c: number) => {
      if (p != c) throw new Error(`Different channel numbers ${p} and ${c}.`);
      return c;
    });
    return this.numChannels;
  }

  convertToImageData(channelNr: number): Promise<ImageData>[] {
    return this._tensors.map(tensor => {
      const channel = tensor.slice([0, 0, channelNr - 1], [tensor.shape[0], tensor.shape[1], 1]);
      return browser.toPixels(channel)
        .then(bytes => {
          const [height, width] = channel.shape.slice(0, 2);
          return new ImageData(bytes, width, height);
        });
    });
  }
}
