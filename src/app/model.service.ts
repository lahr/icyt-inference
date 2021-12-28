import {Injectable} from '@angular/core';
import {Observable, Subject, Subscriber} from "rxjs";
import {GraphModel, loadGraphModel} from "@tensorflow/tfjs";
import {AppSettings} from "./app-settings";

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  static readonly selectedChannels: number[] = [1, 2, 3, 4, 5, 6, 9];

  private selectedChannelsSource = new Subject<number[]>();
  public selectedChannelsObservable = this.selectedChannelsSource.asObservable();

  private modelSource = new Subject<string>();
  public modelObservable = this.modelSource.asObservable();

  private serializedModel?: string;

  constructor() {
  }

  loadModel(modelName: string): Observable<number> {
    return new Observable<number>((subscriber: Subscriber<number>) => {
      this.loadGraphModel(modelName, subscriber)
        .then((model: GraphModel) => this.modelToJson(model))
        .then((serializedModel: string) => {
          this.selectedChannelsSource.next(ModelService.selectedChannels)
          this.modelSource.next(serializedModel)
          this.serializedModel = serializedModel;
          subscriber.complete();
        })
        .catch(error => subscriber.error(error));
    });
  }

  private loadGraphModel(modelName: string, subscriber: Subscriber<number>): Promise<GraphModel> {
    return loadGraphModel(`${AppSettings.MODEL_BASE_URL}/${modelName}/model.json`, {
      onProgress: p => {
        subscriber.next(Math.round(p * 100));
      }
    });
  }

  private modelToJson(model: GraphModel): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./model.worker', import.meta.url));
      worker.onmessage = ({data}) => {
        resolve(data as string);
      };
      worker.postMessage((<any>model).artifacts);
    })
  }
}
