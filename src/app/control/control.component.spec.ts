import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {ControlComponent} from './control.component';
import {Subject, throwError} from "rxjs";
import {ModelService} from "../service/model.service";
import {PredictService} from "../service/predict.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TensorService} from "../service/tensor.service";
import {Predictions} from "../domain/predictions";
import {ImageService} from "../service/image.service";
import {HarnessLoader} from "@angular/cdk/testing";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {MatButtonModule} from "@angular/material/button";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressSpinnerHarness} from "@angular/material/progress-spinner/testing";
import {MatButtonHarness} from "@angular/material/button/testing";

describe('ControlComponent', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;
  let loader: HarnessLoader;

  let imageServiceSpy: jasmine.SpyObj<ImageService>;
  let tensorServiceSpy: jasmine.SpyObj<TensorService>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;
  let predictServiceSpy: jasmine.SpyObj<PredictService>;

  let channelSubject: Subject<number>;
  let modelSubject: Subject<[string, number[]]>;
  let predictionSubject: Subject<Predictions[]>;

  function findSpinnerWithinParent(selector: string) {
    return loader.getChildLoader(selector)
      .then(childLoader => childLoader.getHarness(MatProgressSpinnerHarness));
  }

  function findButtonWithCaption(caption: string) {
    return loader.getHarness(MatButtonHarness.with({text: caption}));
  }

  function getLoadImagesButton() {
    return findButtonWithCaption('Upload images');
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

  beforeEach(async () => {
    channelSubject = new Subject<number>();
    const channelObservable = channelSubject.asObservable();
    predictionSubject = new Subject<Predictions[]>();
    const predictionObservable = predictionSubject.asObservable();
    modelSubject = new Subject<[string, number[]]>();
    const modelObservable = modelSubject.asObservable();

    imageServiceSpy = jasmine.createSpyObj('ImageService', ['loadImages', 'loadDemoImages']);
    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData'], {channelObservable: channelObservable});
    modelServiceSpy = jasmine.createSpyObj('ModelService', ['loadModel'], {modelObservable: modelObservable});
    predictServiceSpy = jasmine.createSpyObj('PredictService', ['predict'], {predictionObservable: predictionObservable});

    await TestBed.configureTestingModule({
      declarations: [ControlComponent],
      imports: [HttpClientTestingModule, MatButtonModule, MatProgressSpinnerModule],
      providers: [
        {provide: ImageService, useValue: imageServiceSpy},
        {provide: TensorService, useValue: tensorServiceSpy},
        {provide: ModelService, useValue: modelServiceSpy},
        {provide: PredictService, useValue: predictServiceSpy}]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('load demo images button should be enabled', async () => {
    const loadImagesButton = await getLoadDemoImagesButton();
    expect(await loadImagesButton.isDisabled()).toBeFalse();
  });

  it('should disable load demo images button when clicked', async () => {
    const loadDemoImagesButton = await getLoadDemoImagesButton();
    expect(await loadDemoImagesButton.isDisabled()).toBeFalse();
    await loadDemoImagesButton.click();
    expect(await loadDemoImagesButton.isDisabled()).toBeTrue();
  });

  it('#loadDemoImages should query ImageService', fakeAsync(() => {
    const loadCall = imageServiceSpy.loadDemoImages.and.returnValue(Promise.resolve([new ArrayBuffer(0)]));
    component.loadDemoImages();
    expect(loadCall).toHaveBeenCalledTimes(1);
    tick();
    expect(tensorServiceSpy.initializeTensors).toHaveBeenCalledTimes(1);
  }));

  it('#loadDemoImages should display error when failed', fakeAsync(() => {
    spyOn(window, 'alert');
    const expectedMessage = 'err';
    const loadCall = imageServiceSpy.loadDemoImages.and.callFake(() => Promise.reject(expectedMessage));
    component.loadDemoImages();
    expect(loadCall).toHaveBeenCalledTimes(1);
    tick();
    fixture.detectChanges();
    expect(tensorServiceSpy.initializeTensors).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expectedMessage);
  }));

  it('#loadImages should hide progress spinner on success', async () => {
    const spinner = await findSpinnerWithinParent('.load-image');
    const spinnerHost = await spinner.host();
    const loadCall = imageServiceSpy.loadImages.and.returnValue(Promise.resolve([new ArrayBuffer(0)]));
    expect(await spinnerHost.getCssValue('visibility')).toBe('hidden');
    component.loadImages({target: {files: []}});
    expect(await spinnerHost.getCssValue('visibility')).toBe('visible');
    expect(loadCall).toHaveBeenCalledTimes(1);
    expect(tensorServiceSpy.initializeTensors).toHaveBeenCalledTimes(1);
    expect(await spinnerHost.getCssValue('visibility')).toBe('hidden');
  });

  it('#loadImages should display error and enable buttons when failed', fakeAsync(async () => {
    spyOn(window, 'alert');
    const expectedMessage = "err";
    const loadCall = imageServiceSpy.loadImages.and.callFake(() => Promise.reject(expectedMessage));
    component.loadImages({target: {files: []}});
    expect(loadCall).toHaveBeenCalledTimes(1);
    tick();
    fixture.detectChanges();
    expect(tensorServiceSpy.initializeTensors).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(expectedMessage);
    const loadImagesButton = await getLoadImagesButton();
    expect(await loadImagesButton.isDisabled()).toBeFalse();
    const loadDemoImagesButton = await getLoadDemoImagesButton();
    expect(await loadDemoImagesButton.isDisabled()).toBeFalse();
  }));

  it('should hide progress spinner when model was loaded successfully', async () => {
    const spinner = await findSpinnerWithinParent('.load-model');
    const spinnerHost = await spinner.host();
    const subj = new Subject<number>();
    const obs = subj.asObservable();
    const modelServiceCall = modelServiceSpy.loadModel.and.returnValue(obs);
    expect(await spinnerHost.getCssValue('visibility')).toBe('hidden');
    component.loadModel();
    expect(await spinnerHost.getCssValue('visibility')).toBe('visible');
    subj.next(1);
    subj.next(100);
    expect(modelServiceCall).toHaveBeenCalledTimes(1);
    subj.complete();
    expect(await spinnerHost.getCssValue('visibility')).toBe('hidden');
  });

  it('should show an error if model cannot be loaded', async () => {
    spyOn(window, 'alert');
    const error404 = 'Error 404'
    const spyAnd = modelServiceSpy.loadModel.and.returnValue(throwError(() => error404))
    const loadModelButton = await getLoadModelButton();
    await loadModelButton.click();
    expect(spyAnd.calls.count()).toBe(1);
    fixture.detectChanges()
    expect(window.alert).toHaveBeenCalledOnceWith(error404);
  });

  it('predict button should be enabled when tensors and model initialized', async () => {
    channelSubject.next(2);
    modelSubject.next(['model', [1]]);
    const predictButton = await getPredictButton();
    expect(await predictButton.isDisabled()).toBeFalse();
  });

  it('predict button should be disabled when model not initialized', async () => {
    channelSubject.next(2);
    const predictButton = await getPredictButton();
    expect(await predictButton.isDisabled()).toBeTrue();
  });

  it('predict button should be disabled when tensors not initialized', async () => {
    modelSubject.next(['model', [1]]);
    const predictButton = await getPredictButton();
    expect(await predictButton.isDisabled()).toBeTrue();
  });

  it('predict button should be disabled when tensor and model not initialized', async () => {
    const predictButton = await getPredictButton();
    expect(await predictButton.isDisabled()).toBeTrue();
  });

  it('should disable predict button when clicked', async () => {
    channelSubject.next(2);
    modelSubject.next(['model', [1]]);

    fixture.detectChanges();
    const predictButton = await getPredictButton();
    expect(await predictButton.isDisabled()).toBeFalse();
    await predictButton.click();
    expect(await predictButton.isDisabled()).toBeTrue();
  });

  it('#predict should query PredictService', () => {
    const predictCall = predictServiceSpy.predict.and.returnValue(Promise.resolve());
    component.predict();
    expect(predictCall).toHaveBeenCalledTimes(1);
  });

  it('#predict should display error when failed', fakeAsync(() => {
    spyOn(window, 'alert');
    const expectedMessage = 'err';
    const predictCall = predictServiceSpy.predict.and.callFake(() => Promise.reject(expectedMessage));
    component.predict();
    expect(predictCall).toHaveBeenCalledTimes(1);
    tick();
    fixture.detectChanges();
    expect(window.alert).toHaveBeenCalledOnceWith(expectedMessage);
  }));
});
