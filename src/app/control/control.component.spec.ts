import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {ControlComponent} from './control.component';
import {of, Subject, throwError} from "rxjs";
import {ModelService} from "../service/model.service";
import {PredictService} from "../service/predict.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Type} from "@angular/core";
import {TensorService} from "../service/tensor.service";
import {Predictions} from "../domain/predictions";

describe('ControlComponent', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;

  let httpMock: HttpTestingController;
  let tensorServiceSpy: jasmine.SpyObj<TensorService>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;
  let predictServiceSpy: jasmine.SpyObj<PredictService>;

  let channelSubject: Subject<number>;
  let modelSubject: Subject<[string, number[]]>;
  let predictionSubject: Subject<Predictions[]>;

  function findButtonWithCaption(caption: string) {
    return fixture.debugElement
      .query(debugEl => debugEl.name === 'button' && debugEl.nativeElement.textContent === caption).nativeElement;
  }

  function getLoadDemoImagesButton() {
    return findButtonWithCaption('Load demo images');
  }

  function getLoadModelButton() {
    return findButtonWithCaption('Load model');
  }

  function getPredictButton() {
    return findButtonWithCaption('Predict');
  }

  function expectHttpCalls() {
    httpMock.expectOne('assets/demo/demo-image-01-acer.pseudoplatanus.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-02-corylus.avellana.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-03-betula.pendula.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-04-quercus.robur.tif').flush(new ArrayBuffer(0));
    httpMock.verify();
  }

  beforeEach(async () => {
    channelSubject = new Subject<number>();
    const channelObservable = channelSubject.asObservable();
    predictionSubject = new Subject<Predictions[]>();
    const predictionObservable = predictionSubject.asObservable();
    modelSubject = new Subject<[string, number[]]>();
    const modelObservable = modelSubject.asObservable();

    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData'], {channelObservable: channelObservable});
    modelServiceSpy = jasmine.createSpyObj('ModelService', ['loadModel'], {modelObservable: modelObservable});
    predictServiceSpy = jasmine.createSpyObj('PredictService', ['predict'], {predictionObservable: predictionObservable});

    await TestBed.configureTestingModule({
      declarations: [ControlComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {provide: TensorService, useValue: tensorServiceSpy},
        {provide: ModelService, useValue: modelServiceSpy},
        {provide: PredictService, useValue: predictServiceSpy}]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();
  });

  it('load demo images button should be enabled', () => {
    expect(getLoadDemoImagesButton().disabled).toBeFalse();
  });

  it('should disable load demo images button when clicked', () => {
    expect(getLoadDemoImagesButton().disabled).toBeFalse();
    getLoadDemoImagesButton().click();
    fixture.detectChanges();
    expect(getLoadDemoImagesButton().disabled).toBeTrue();
  });

  it('#loadDemoImages should fetch images and query TensorService', () => {
    component.loadDemoImages({target: {disabled: false}});
    expectHttpCalls();
    expect(tensorServiceSpy.initializeTensors).toHaveBeenCalledTimes(1);
  });

  it('should display that model has been successfully loaded', () => {
    const dummyValue = 1;
    const modelServiceCall = modelServiceSpy.loadModel.and.returnValue(of(dummyValue))
    getLoadModelButton().click();
    expect(modelServiceCall.calls.count()).toBe(1);
    fixture.detectChanges()
    const statusField = fixture.debugElement
      .query(debugEl => debugEl.nativeElement.id === 'model-progress').nativeElement;
    expect(statusField.textContent).toBe('Model \'f93937c\' loaded')
  });

  it('should show an error if model cannot be loaded', () => {
    const error404 = 'Error 404'
    const spyAnd = modelServiceSpy.loadModel.and.returnValue(throwError(() => error404))
    getLoadModelButton().click();
    expect(spyAnd.calls.count()).toBe(1);
    fixture.detectChanges()
    const statusField = fixture.debugElement
      .query(debugEl => debugEl.nativeElement.id === 'model-progress').nativeElement;
    expect(statusField.textContent).toBe(error404)
  });

  it('predict button should be enabled when tensors and model initialized', () => {
    channelSubject.next(2);
    modelSubject.next(['model', [1]]);
    fixture.detectChanges()
    expect(getPredictButton().disabled).toBeFalse();
  });

  it('predict button should be disabled when model not initialized', () => {
    channelSubject.next(2);
    fixture.detectChanges();
    expect(getPredictButton().disabled).toBeTrue();
  });

  it('predict button should be disabled when tensors not initialized', () => {
    modelSubject.next(['model', [1]]);
    fixture.detectChanges();
    expect(getPredictButton().disabled).toBeTrue();
  });

  it('predict button should be disabled when tensor and model not initialized', () => {
    expect(getPredictButton().disabled).toBeTrue();
  });

  it('should disable predict button when clicked', () => {
    channelSubject.next(2);
    modelSubject.next(['model', [1]]);

    fixture.detectChanges()
    expect(getPredictButton().disabled).toBeFalse()
    getPredictButton().click();
    fixture.detectChanges();
    expect(getPredictButton().disabled).toBeTrue();
  });
});
