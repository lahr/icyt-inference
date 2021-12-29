import {Injectable} from '@angular/core';
import {Tensor2D} from "@tensorflow/tfjs";
import {Prediction} from "../domain/prediction";
import {Tensor} from "@tensorflow/tfjs-core/dist/tensor";
import {CLASS_NAMES} from "../domain/classes";
import {SerializedTensor} from "../domain/serialized-tensor";
import {Predictions} from "../domain/predictions";
import {TensorService} from "./tensor.service";
import {ModelService} from "./model.service";
import {Subject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class PredictService {

  private static readonly TOP_N_PREDICTIONS: number = 3;

  private predictionSource = new Subject<Predictions[]>();
  public predictionObservable = this.predictionSource.asObservable();

  private serializedModel?: string;
  private selectedChannels?: number[];

  constructor(private tensorService: TensorService,
              private modelService: ModelService) {
    this.modelService.modelObservable.subscribe(([serializedModel, selectedChannels]) => {
      this.serializedModel = serializedModel;
      this.selectedChannels = selectedChannels;
    })
  }

  predict(): Promise<void> {
    return this.tensorService.convertToPredictTensors(this.selectedChannels!)
      .then(tensor => this.predictWithWorker(new SerializedTensor(tensor)))
      .then(predictionTensor => {
        const predictions = this.initializePredictions(predictionTensor);
        this.predictionSource.next(predictions);
      });
  }

  private predictWithWorker(serializedTensor: SerializedTensor): Promise<Tensor2D> {
    const worker: Worker = new Worker(new URL('../worker/predict.worker', import.meta.url));
    const promise: Promise<Tensor2D> = new Promise<Tensor2D>((resolve, reject) => {
      worker.onmessage = ({data}) => {
        resolve(SerializedTensor.deserialize(data));
      };
      worker.onerror = (e: ErrorEvent) => {
        e.preventDefault();
        reject(new Error(e.message));
      }
    });
    worker.postMessage({
      serializedModel: this.serializedModel,
      serializedTensor: serializedTensor
    });
    return promise;
  }

  private initializePredictions(predictionTensor: Tensor2D): Predictions[] {
    const predictions: Predictions[] = []
    predictionTensor.unstack().forEach((predictionTensor: Tensor) => {
      const result = Array.from(predictionTensor.dataSync())
        .map((p: number, i: number) => new Prediction(CLASS_NAMES[i], p))
        .sort((a: Prediction, b: Prediction) => b.probability - a.probability)
        .slice(0, PredictService.TOP_N_PREDICTIONS);
      predictions.push(new Predictions(result));
    });
    return predictions;
  }
}
