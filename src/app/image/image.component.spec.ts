import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ImageComponent} from './image.component';
import {of} from "rxjs";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Type} from "@angular/core";
import {TensorService} from "../tensor.service";
import {By} from "@angular/platform-browser";
import {ModelService} from "../model.service";

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;
  let httpMock: HttpTestingController;
  let tensorServiceSpy: jasmine.SpyObj<TensorService>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;
  const mockImageDataChannel1: ImageData = new ImageData(new Uint8ClampedArray([162, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);
  const mockImageDataChannel1Base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdjXLRo0f8lS5Yw7Nq1i4Hx//////X19RliY2MZAL4BDKJitCm7AAAAAElFTkSuQmCC';
  const mockImageDataChannel2: ImageData = new ImageData(new Uint8ClampedArray([184, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);
  const mockImageDataChannel2Base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdj3LFo0f++JUsYdu3axcD4//////r6+gyxsbEMAL5ZDKKcMYgZAAAAAElFTkSuQmCC';

  beforeEach(async () => {
    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData']);
    modelServiceSpy = jasmine.createSpyObj('ModelService', [], {modelObservable: of(['serializedModel', [2]])});

    await TestBed.configureTestingModule({
      declarations: [ImageComponent],
      imports: [HttpClientTestingModule],
      providers: [{provide: TensorService, useValue: tensorServiceSpy},
        {provide: ModelService, useValue: modelServiceSpy}]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();
  })

  function expectHttpCalls() {
    httpMock.expectOne('assets/demo/demo-image-01-acer.pseudoplatanus.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-02-corylus.avellana.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-03-betula.pendula.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-04-quercus.robur.tif').flush(new ArrayBuffer(0));
    httpMock.verify();
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#loadDemoImage should set button disabled', () => {
    expect(component.disabled).withContext('enabled at first').toBe(false);
    component.loadDemoImages();
    expect(component.disabled).withContext('disabled after click').toBe(true);
  });

  function findButtonWithCaption(caption: string) {
    return fixture.debugElement
      .query(debugEl => debugEl.name === 'button' && debugEl.nativeElement.textContent === caption).nativeElement;
  }

  function clickLoadDemoImagesButton() {
    findButtonWithCaption('Load demo images').click();
  }

  it('should show channel buttons when tensor initialized', fakeAsync(() => {
    const spyCallInitializeTensors = tensorServiceSpy.initializeTensors.and.returnValue(Promise.resolve(2))
    const spyCallConvertToImageData = tensorServiceSpy.convertToImageData.and.returnValue([Promise.resolve(mockImageDataChannel1)]);
    clickLoadDemoImagesButton();
    tick();
    expectHttpCalls();
    expect(spyCallInitializeTensors.calls.count()).toBe(1);
    tick();
    expect(spyCallConvertToImageData.calls.count()).toBe(1);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('.channel-button'));
    expect(buttons.length).toBe(2);
    const buttonCaptions = buttons.map(button => button.nativeElement.textContent);
    expect(buttonCaptions).toContain('1');
    expect(buttonCaptions).toContain('2');
  }));

  it('should show channel 0 when tensor initialized ', fakeAsync(() => {
    const spyCallInitializeTensors = tensorServiceSpy.initializeTensors.and.returnValue(Promise.resolve(2))
    const spyCallConvertToImageData = tensorServiceSpy.convertToImageData.and.returnValue([Promise.resolve(mockImageDataChannel1)]);
    clickLoadDemoImagesButton();
    tick();
    expectHttpCalls();
    expect(spyCallInitializeTensors.calls.count()).toBe(1);
    tick();
    expect(spyCallConvertToImageData.calls.count()).toBe(1);
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel1Base64);
  }));

  it('should switch channel onmouseenter', fakeAsync(() => {
    const spyCallInitializeTensors = tensorServiceSpy.initializeTensors.and.returnValue(Promise.resolve(2))
    const spyCallConvertToImageData = tensorServiceSpy.convertToImageData.withArgs(1).and.returnValue([Promise.resolve(mockImageDataChannel1)]);
    clickLoadDemoImagesButton();
    tick();
    expectHttpCalls();
    expect(spyCallInitializeTensors.calls.count()).toBe(1);
    tick();
    expect(spyCallConvertToImageData.calls.count()).toBe(1);
    fixture.detectChanges();

    let img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel1Base64);

    const spyCallConvertToImageData2 = tensorServiceSpy.convertToImageData.withArgs(2).and.returnValue([Promise.resolve(mockImageDataChannel2)])
    findButtonWithCaption('2').dispatchEvent(new Event('mouseenter'));
    tick();
    fixture.detectChanges();
    expect(spyCallConvertToImageData2).toHaveBeenCalled();

    img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel2Base64);
  }));

  it('should highlight channel buttons that are used for inference', fakeAsync(() => {
    const spyCallInitializeTensors = tensorServiceSpy.initializeTensors.and.returnValue(Promise.resolve(2))
    const spyCallConvertToImageData = tensorServiceSpy.convertToImageData.and.returnValue([Promise.resolve(mockImageDataChannel1)]);
    clickLoadDemoImagesButton();
    tick();
    expectHttpCalls();
    expect(spyCallInitializeTensors.calls.count()).toBe(1);
    tick();
    expect(spyCallConvertToImageData.calls.count()).toBe(1);
    fixture.detectChanges();

    const channelButton1 = findButtonWithCaption('1');
    expect(channelButton1.classList.contains('active')).toBeFalse();
    const channelButton2 = findButtonWithCaption('2');
    expect(channelButton2.classList.contains('active')).toBeTrue();
  }));
});
