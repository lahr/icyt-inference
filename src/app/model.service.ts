import {Injectable} from '@angular/core';
import {Observable, Subject, Subscriber} from "rxjs";
import {GraphModel, loadGraphModel} from "@tensorflow/tfjs";
import {AppSettings} from "./app-settings";

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  private modelSource = new Subject<GraphModel>();
  public model = this.modelSource.asObservable();

  constructor() {
  }

  loadModel(modelName: string): Observable<number> {
    return new Observable<number>((subscriber: Subscriber<number>) => {
      loadGraphModel(`${AppSettings.MODEL_BASE_URL}/${modelName}/model.json`, {
        onProgress: p => {
          subscriber.next(Math.round(p * 100));
        }
      }).then((model: GraphModel) => {
        this.modelSource.next(model);
        subscriber.complete();
      }).catch(error => subscriber.error(error));
    });
  }
}
