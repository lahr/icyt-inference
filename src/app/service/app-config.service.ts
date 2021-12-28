import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subscription} from "rxjs";
import {AppSettings} from "../domain/app-settings";

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  constructor(private httpClient: HttpClient) {
  }

  load(): Subscription {
    console.log('Loading configuration');
    return this.httpClient.get('/assets/app-config.json')
      .subscribe((config: any) => {
        AppSettings.MODEL_BASE_URL = config.MODEL_BASE_URL;
        console.log(`AppSettings.MODEL_BASE_URL=${AppSettings.MODEL_BASE_URL}`);
      })
  }
}
