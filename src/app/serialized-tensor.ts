import {Rank} from "@tensorflow/tfjs-core/dist/types";
import {Tensor} from "@tensorflow/tfjs-core/dist/tensor";
import {ShapeMap, tensor} from "@tensorflow/tfjs";

export class SerializedTensor<R extends Rank = Rank> {
  private data: Uint8Array | Int32Array | Float32Array;
  private shape: ShapeMap[R];

  constructor(tensor: Tensor<R>) {
    this.data = tensor.dataSync();
    this.shape = tensor.shape;
  }

  public static deserialize<R extends Rank = Rank>(serializedTensor: SerializedTensor<R>): Tensor<R> {
    return tensor(serializedTensor.data, serializedTensor.shape as ShapeMap[R]);
  }
}
