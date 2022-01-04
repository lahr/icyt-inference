import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ImageComponent} from './image.component';
import {Subject} from "rxjs";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TensorService} from "../service/tensor.service";
import {By} from "@angular/platform-browser";
import {ModelService} from "../service/model.service";
import {PredictService} from "../service/predict.service";
import {Predictions} from "../domain/predictions";
import {Prediction} from "../domain/prediction";
import {HarnessLoader} from "@angular/cdk/testing";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {MatButtonToggleHarness} from "@angular/material/button-toggle/testing";
import {MatButtonToggleModule} from "@angular/material/button-toggle";

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;
  let tensorServiceSpy: jasmine.SpyObj<TensorService>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;
  let predictServiceSpy: jasmine.SpyObj<PredictService>;
  const mockImageDataChannel1: ImageData = new ImageData(new Uint8ClampedArray([162, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);
  const mockImageDataChannel1Base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdjXLRo0f8lS5Yw7Nq1i4Hx//////X19RliY2MZAL4BDKJitCm7AAAAAElFTkSuQmCC';
  const mockImageDataChannel2: ImageData = new ImageData(new Uint8ClampedArray([184, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);
  const mockImageDataChannel2Base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdj3LFo0f++JUsYdu3axcD4//////r6+gyxsbEMAL5ZDKKcMYgZAAAAAElFTkSuQmCC';
  let channelSubject: Subject<number>;
  let modelSubject: Subject<[string, number[]]>;
  let predictionSubject: Subject<Predictions[]>;
  let loader: HarnessLoader;

  function findChannelButtonWithCaption(caption: string) {
    return loader.getHarness(MatButtonToggleHarness.with({text: caption}));
  }

  beforeEach(async () => {
    channelSubject = new Subject<number>();
    const channelObservable = channelSubject.asObservable();
    predictionSubject = new Subject<Predictions[]>();
    const predictionObservable = predictionSubject.asObservable();
    modelSubject = new Subject<[string, number[]]>();
    const modelObservable = modelSubject.asObservable();

    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData'], {channelObservable: channelObservable});
    modelServiceSpy = jasmine.createSpyObj('ModelService', [], {modelObservable: modelObservable});
    predictServiceSpy = jasmine.createSpyObj('PredictService', ['predict'], {predictionObservable: predictionObservable});

    await TestBed.configureTestingModule({
      declarations: [ImageComponent],
      imports: [HttpClientTestingModule, MatButtonToggleModule],
      providers: [{provide: TensorService, useValue: tensorServiceSpy},
        {provide: ModelService, useValue: modelServiceSpy},
        {provide: PredictService, useValue: predictServiceSpy}]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show channel buttons when tensor initialized', fakeAsync(() => {
    const convertCall = tensorServiceSpy.convertToImageData.withArgs(1).and.returnValue([Promise.resolve(mockImageDataChannel1)])
    channelSubject.next(2);
    expect(convertCall).toHaveBeenCalledTimes(1);
    tick();
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('.channel-button'));
    expect(buttons.length).toBe(2);
    const buttonCaptions = buttons.map(button => button.nativeElement.textContent);
    expect(buttonCaptions).toContain('1');
    expect(buttonCaptions).toContain('2');
  }));

  it('should show channel 0 when tensor initialized', fakeAsync(() => {
    const convertCall = tensorServiceSpy.convertToImageData.withArgs(1).and.returnValue([Promise.resolve(mockImageDataChannel1)])
    channelSubject.next(2);
    expect(convertCall).toHaveBeenCalledTimes(1);
    tick();
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel1Base64);
  }));

  it('should switch channel onmouseenter', fakeAsync(async () => {
    const convertCall = tensorServiceSpy.convertToImageData.withArgs(1).and.returnValue([Promise.resolve(mockImageDataChannel1)])
    channelSubject.next(2);
    expect(convertCall).toHaveBeenCalledTimes(1);
    tick();
    fixture.detectChanges();

    let img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel1Base64);

    const spyCallConvertToImageData2 = tensorServiceSpy.convertToImageData.withArgs(2).and.returnValue([Promise.resolve(mockImageDataChannel2)])

    const button2 = await findChannelButtonWithCaption('2');
    const button2Host = await button2.host();
    await button2Host.dispatchEvent('mouseenter');

    tick();
    fixture.detectChanges();
    expect(spyCallConvertToImageData2).toHaveBeenCalled();

    img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel2Base64);
  }));

  it('should highlight channel buttons that are used for inference', fakeAsync(async () => {
    tensorServiceSpy.convertToImageData.withArgs(1).and.returnValue([Promise.resolve(mockImageDataChannel1)])
    channelSubject.next(2);
    modelSubject.next(['modelStr', [2]]);
    tick();
    fixture.detectChanges();

    const button1 = await findChannelButtonWithCaption('1');
    expect(await button1.isChecked()).toBeFalse();

    const button2 = await findChannelButtonWithCaption('2');
    expect(await button2.isChecked()).toBeTrue();
  }));

  it('should show predictions', fakeAsync(() => {
    tensorServiceSpy.convertToImageData.withArgs(1).and.returnValue([Promise.resolve(mockImageDataChannel1)])
    channelSubject.next(2);
    predictionSubject.next([new Predictions([new Prediction('B', 0.5), new Prediction('A', 0.3)])])
    tick();
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector(`.overlay ul`);
    const textContents = Array.from(overlay.children).map((htmlElement: any) => htmlElement.textContent.trim());
    expect(textContents[0]).toBe('0.500 - B');
    expect(textContents[1]).toBe('0.300 - A');
  }));
});
