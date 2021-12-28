import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ModelComponent} from './model.component';
import {ModelService} from "../service/model.service";
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

  function getLoadModelButton() {
    return fixture.debugElement
      .query(buttonDebugEl => buttonDebugEl.nativeElement.textContent === 'Load model').nativeElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable load model button when clicked', () => {
    modelServiceSpy.loadModel.and.returnValue(of(1))
    const loadModelButton = getLoadModelButton();
    expect(loadModelButton.disabled).toBeFalse();
    loadModelButton.click();
    expect(loadModelButton.disabled).toBeTrue();
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
});
