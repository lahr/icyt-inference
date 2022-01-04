import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ImageComponent} from './image/image.component';
import {HttpClientModule} from "@angular/common/http";
import {AppConfigService} from "./service/app-config.service";
import {ControlComponent} from './control/control.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatButtonModule} from "@angular/material/button";

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
    HttpClientModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatButtonModule
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
