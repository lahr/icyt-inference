import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModelComponent} from './model.component';
import {ModelService} from "../model.service";
import {of, throwError} from "rxjs";

describe('ModelComponent', () => {
  let component: ModelComponent;
  let fixture: ComponentFixture<ModelComponent>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;

  beforeEach(async () => {
    modelServiceSpy = jasmine.createSpyObj('ModelService', ['loadModel']);
    await TestBed.configureTestingModule({
      declarations: [ModelComponent],
      providers: [{provide: ModelService, useValue: modelServiceSpy}]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable load model button when clicked', () => {
    modelServiceSpy.loadModel.and.returnValue(of(1))
    const loadModelButton = fixture.debugElement
      .query(buttonDebugEl => buttonDebugEl.nativeElement.textContent === 'Load model').nativeElement;
    expect(loadModelButton.disabled).toBeFalse();
    loadModelButton.click();
    expect(loadModelButton.disabled).toBeTrue();
  });

  it('should show an error if model cannot be loaded', () => {
    const error404 = 'Error 404'
    const spyAnd = modelServiceSpy.loadModel.and.returnValue(throwError(() => error404))
    fixture.debugElement
      .query(buttonDebugEl => buttonDebugEl.nativeElement.textContent === 'Load model').nativeElement
      .click();
    expect(spyAnd.calls.count()).toBe(1);
    fixture.detectChanges()
    const statusField = fixture.debugElement
      .query(debugEl => debugEl.nativeElement.id === 'model-progress').nativeElement;
    expect(statusField.textContent).toBe(error404)
  });

  it('should display that model has been successfully loaded', () => {
    const dummyValue = 1;
    const spyAnd = modelServiceSpy.loadModel.and.returnValue(of(dummyValue))
    fixture.debugElement
      .query(buttonDebugEl => buttonDebugEl.nativeElement.textContent === 'Load model').nativeElement
      .click();
    expect(spyAnd.calls.count()).toBe(1);
    fixture.detectChanges()
    const statusField = fixture.debugElement
      .query(debugEl => debugEl.nativeElement.id === 'model-progress').nativeElement;
    expect(statusField.textContent).toBe('Model \'f93937c\' loaded')
  });
});
