import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PredictComponent} from './predict.component';
import {ModelService} from "../service/model.service";
import {of} from "rxjs";
import {PredictService} from "../service/predict.service";
import {Predictions} from "../domain/predictions";

describe('PredictComponent', () => {
  let component: PredictComponent;
  let fixture: ComponentFixture<PredictComponent>;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;
  let predictServiceSpy: jasmine.SpyObj<PredictService>;

  beforeEach(async () => {
    modelServiceSpy = jasmine.createSpyObj('ModelService', [], {modelObservable: of(['serializedModel', [2]])});
    predictServiceSpy = jasmine.createSpyObj('PredictService', ['predict'])
    await TestBed.configureTestingModule({
      declarations: [PredictComponent],
      providers: [{provide: PredictService, useValue: predictServiceSpy},
        {provide: ModelService, useValue: modelServiceSpy}]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function getPredictButton() {
    return fixture.debugElement
      .query(debugEl => debugEl.name === 'button' && debugEl.nativeElement.textContent === 'Predict').nativeElement;
  }

  it('should disable predict button when clicked', () => {
    predictServiceSpy.predict.and.returnValue(Promise.resolve([new Predictions([])]))
    expect(getPredictButton().disabled).toBeFalse();
    getPredictButton().click();
    fixture.detectChanges();
    expect(getPredictButton().disabled).toBeTrue();
  });
});
