import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {ImageComponent} from './image.component';
import {of, Subject} from "rxjs";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Type} from "@angular/core";
import {TensorService} from "../tensor.service";
import {Tensor3D, tensor3d} from "@tensorflow/tfjs";

describe('ImageComponent', () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;
  let httpMock: HttpTestingController;
  let tensorServiceSpy: jasmine.SpyObj<TensorService>;
  const mockTensor: Tensor3D = tensor3d([[[0.6, 1], [0.2, 0.5], [0, 1]], [[1, 0.5], [0.1, 0], [0.5, 0.5]]])
  const mockImageDataChannel0: ImageData = new ImageData(new Uint8ClampedArray([162, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);
  const mockImageDataChannel0Base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdjXLRo0f8lS5Yw7Nq1i4Hx//////X19RliY2MZAL4BDKJitCm7AAAAAElFTkSuQmCC';
  const mockImageDataChannel1: ImageData = new ImageData(new Uint8ClampedArray([184, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);
  const mockImageDataChannel1Base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAAAXNSR0IArs4c6QAAACNJREFUGFdj3LFo0f++JUsYdu3axcD4//////r6+gyxsbEMAL5ZDKKcMYgZAAAAAElFTkSuQmCC';

  beforeEach(async () => {
    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData'], {tensorObservable: new Subject<Tensor3D[]>().asObservable()});

    await TestBed.configureTestingModule({
      declarations: [ImageComponent],
      imports: [HttpClientTestingModule],
      providers: [{provide: TensorService, useValue: tensorServiceSpy}]
    }).compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('#loadDemoImage should set button disabled', () => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();
    expect(component.disabled).withContext('enabled at first').toBe(false);
    component.loadDemoImages();
    expect(component.disabled).withContext('disabled after click').toBe(true);
  });

  it('#loadDemoImage should fetch demo images when button clicked', () => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();
    const tensorServiceCall = tensorServiceSpy.initializeTensors;
    component.loadDemoImages();
    httpMock.expectOne('assets/demo/demo-image-01-acer.pseudoplatanus.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-02-corylus.avellana.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-03-betula.pendula.tif').flush(new ArrayBuffer(0));
    httpMock.expectOne('assets/demo/demo-image-04-quercus.robur.tif').flush(new ArrayBuffer(0));
    httpMock.verify();
    expect(tensorServiceCall.calls.count()).toBe(1);
  });

  it('should show channel buttons when tensor initialized', () => {
    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData'], {tensorObservable: of([mockTensor])});
    TestBed.overrideProvider(TensorService, {useValue: tensorServiceSpy})
    tensorServiceSpy.convertToImageData.withArgs([mockTensor], 0).and.returnValue([Promise.resolve(mockImageDataChannel0)])
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(el => el.nativeElement.textContent === '0' || el.nativeElement.textContent === '1');
    expect(buttons.length).toBe(2);
  });

  it('should show channel 0 when tensor initialized ', fakeAsync(() => {
    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData'], {tensorObservable: of([mockTensor])});
    TestBed.overrideProvider(TensorService, {useValue: tensorServiceSpy})
    tensorServiceSpy.convertToImageData.withArgs([mockTensor], 0).and.returnValue([Promise.resolve(mockImageDataChannel0)])
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();

    tick();
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel0Base64);
  }));

  it('should switch channel onmouseenter', fakeAsync(() => {
    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToImageData'], {tensorObservable: of([mockTensor])});
    TestBed.overrideProvider(TensorService, {useValue: tensorServiceSpy})
    tensorServiceSpy.convertToImageData.withArgs([mockTensor], 0).and.returnValue([Promise.resolve(mockImageDataChannel0)])
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    httpMock = fixture.debugElement.injector.get<HttpTestingController>(HttpTestingController as Type<HttpTestingController>);
    fixture.detectChanges();

    tick();
    fixture.detectChanges();
    let img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel0Base64);

    tensorServiceSpy.convertToImageData.withArgs([mockTensor], 1).and.returnValue([Promise.resolve(mockImageDataChannel1)])
    const channelButton1 = fixture.debugElement.query(el => el.nativeElement.textContent === '1').nativeElement;
    let event = new Event('mouseenter');
    channelButton1.dispatchEvent(event);

    tick();
    fixture.detectChanges();
    img = fixture.nativeElement.querySelector('img');
    expect(img.src).toBe(mockImageDataChannel1Base64);
  }));
});
