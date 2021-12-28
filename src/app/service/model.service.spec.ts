import {TestBed} from '@angular/core/testing';

import {ModelService} from './model.service';
import {AppSettings} from "../domain/app-settings";

describe('ModelService', () => {
  let service: ModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelService);
    AppSettings.MODEL_BASE_URL = '/assets-test/models'
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should complete without error if model can be loaded', (done: DoneFn) => {
    service.loadModel('mock-model').subscribe({
      next: progress => expect(progress).toBeGreaterThanOrEqual(0),
      error: error => done.fail('should not throw error'),
      complete: () => done()
    })
  });

  it('should throw an error if model cannot be loaded', (done: DoneFn) => {
    service.loadModel('invalid').subscribe({
      next: progress => done.fail('should not progress'),
      error: err => {
        expect(err).toEqual(new Error('Request to /assets-test/models/invalid/model.json failed with status code 404. Please verify this URL points to the model JSON of the model to load.'));
        done();
      },
      complete: () => done.fail('should not complete')
    })
  });

  it('should throw an error if model cannot be serialized', (done: DoneFn) => {
    spyOn<any>(service, 'loadGraphModel').and.returnValue(Promise.resolve({artifacts: {}}))
    service.loadModel('mock-model').subscribe({
      error: err => {
        expect(err).toEqual(new Error('Uncaught Error: weightData must not be undefined'));
        done();
      },
      complete: () => done.fail('should not complete')
    })
  });
});
