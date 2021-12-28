import {Injectable} from '@angular/core';
import {Observable, Subject, Subscriber} from "rxjs";
import {GraphModel, loadGraphModel} from "@tensorflow/tfjs";
import {AppSettings} from "../domain/app-settings";

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  private static readonly SELECTED_CHANNELS: number[] = [1, 2, 3, 4, 5, 6, 9];

  private modelSource = new Subject<[string, number[]]>();
  public modelObservable = this.modelSource.asObservable();

  constructor() {
  }

  loadModel(modelName: string): Observable<number> {
    return new Observable<number>((subscriber: Subscriber<number>) => {
      this.loadGraphModel(modelName, subscriber)
        .then((model: GraphModel) => this.modelToJson(model))
        .then((serializedModel: string) => {
          this.modelSource.next([serializedModel, ModelService.SELECTED_CHANNELS])
          subscriber.complete();
        })
        .catch(error => subscriber.error(error));
    });
  }

  private loadGraphModel(modelName: string, subscriber: Subscriber<number>): Promise<GraphModel> {
    return loadGraphModel(`${AppSettings.MODEL_BASE_URL}/${modelName}/model.json`, {
      onProgress: p => subscriber.next(Math.round(p * 100))
    });
  }

  private modelToJson(model: GraphModel): Promise<string> {
    const worker = new Worker(new URL('../worker/model.worker', import.meta.url));
    const promise: Promise<string> = new Promise<string>((resolve, reject) => {
      worker.onmessage = ({data}) => resolve(data as string);
      worker.onerror = (e: ErrorEvent) => {
        e.preventDefault();
        reject(new Error(e.message));
      }
    });
    worker.postMessage((<any>model).artifacts);
    return promise;
  }
}
