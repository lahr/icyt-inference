import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import * as tf from "@tensorflow/tfjs";
import {browser, Tensor2D, Tensor3D} from "@tensorflow/tfjs";
import TiffIfd from "tiff/lib/tiffIfd";
import * as tiff from "tiff";

@Injectable({
  providedIn: 'root'
})
export class TensorService {

  private tensorSource = new Subject<Tensor3D[]>();
  tensorObservable = this.tensorSource.asObservable();
  private numChannels: number = 0;

  constructor() {
  }

  private static tiffToTensor(imageBuffer: ArrayBuffer): Tensor3D {
    const image: TiffIfd = tiff.decode(imageBuffer)[0];
    return tf.tensor3d(Array.from(image.data), [image.height, image.width, image.get('SamplesPerPixel')], 'float32');
  }

  initializeTensors(imageBuffers: ArrayBuffer[]): void {
    const tensors = imageBuffers.map(imageBuffer => TensorService.tiffToTensor(imageBuffer));
    this.numChannels = tensors.flatMap(tensor => tensor.shape[2]).reduce((p, c) => {
      if (p != c) this.tensorSource.error(new Error(`Different channel numbers ${p} and ${c}.`))
      return c
    })
    this.tensorSource.next(tensors);
  }

  convertToImageData(tensors: Tensor3D[], channelNr: number): Promise<ImageData>[] {
    return tensors.map(tensor => {
      const channel = TensorService.normalize(tensor.slice([0, 0, channelNr], [tensor.shape[0], tensor.shape[1], 1]));
      return browser.toPixels(channel)
        .then(bytes => {
          const [height, width] = channel.shape.slice(0, 2);
          return new ImageData(bytes, width, height);
        });
    });
  }

  private static normalize(tensor: Tensor3D): Tensor3D {
    const channels: Tensor2D[] = [];
    for (const channel of tensor.unstack(-1)) {
      const numerator = channel.sub(channel.min());
      const denominator = channel.max().sub(channel.min());
      const c: Tensor2D = numerator.divNoNan(denominator);
      channels.push(c);
    }
    return tf.stack(channels, -1) as Tensor3D
  }
}
