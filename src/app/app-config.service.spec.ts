import {TestBed} from '@angular/core/testing';

import {AppConfigService} from './app-config.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {AppSettings} from "./app-settings";

describe('AppConfigService', () => {
  let service: AppConfigService;
  let httpClient: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AppConfigService);
    httpClient = TestBed.inject(HttpTestingController)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch the config and set the variables', () => {
    let mockConfig: any = {MODEL_BASE_URL: '/mock-url'};
    service.load();
    httpClient.expectOne('/assets/app-config.json').flush(mockConfig)
    expect(AppSettings.MODEL_BASE_URL).toBe('/mock-url');
  })
});
