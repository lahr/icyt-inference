import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ImageComponent} from './image/image.component';
import {HttpClientModule} from "@angular/common/http";
import {AppConfigService} from "./service/app-config.service";
import {ControlComponent} from './control/control.component';

const loadSettings = (appConfigService: AppConfigService) => {
  return () => appConfigService.load();
}

@NgModule({
  declarations: [
    AppComponent,
    ControlComponent,
    ImageComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadSettings,
      multi: true,
      deps: [AppConfigService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
