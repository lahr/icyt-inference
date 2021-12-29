import {TestBed} from '@angular/core/testing';

import {PredictService} from './predict.service';
import {of} from "rxjs";
import {ModelService} from "./model.service";
import {TensorService} from "./tensor.service";
import {Predictions} from "../domain/predictions";
import {Prediction} from "../domain/prediction";
import {ones, Tensor2D, tensor2d, Tensor4D, tensor4d} from "@tensorflow/tfjs";

describe('PredictService', () => {
  let service: PredictService;
  let modelServiceSpy: jasmine.SpyObj<ModelService>;
  let tensorServiceSpy: jasmine.SpyObj<TensorService>;
  const selectedChannels = [2];
  const model = 'serializedModel';

  beforeEach(() => {
    modelServiceSpy = jasmine.createSpyObj('ModelService', [], {modelObservable: of([model, selectedChannels])});
    tensorServiceSpy = jasmine.createSpyObj('TensorService', ['initializeTensors', 'convertToPredictTensors']);
    TestBed.configureTestingModule({
      providers: [{provide: ModelService, useValue: modelServiceSpy},
        {provide: TensorService, useValue: tensorServiceSpy}
      ]
    });
    service = TestBed.inject(PredictService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#predict should emit sorted predictions', (done: DoneFn) => {
    const expedctedPredictions = [new Predictions([new Prediction('acer.platanoides', 1),
      new Prediction('acer.pseudoplatanus', 0.5), new Prediction('acer.negundo', 0)])];
    const predictionTensor: Tensor2D = tensor2d([[0, 1, 0.5]], [1, 3]);

    const mockTensor = tensor4d([[[[1]]]], [1, 1, 1, 1])
    const tensorServiceCall = tensorServiceSpy.convertToPredictTensors.withArgs(selectedChannels).and.returnValue(Promise.resolve(mockTensor));
    const predictWithWorkerSpy = spyOn<any>(service, 'predictWithWorker').and.returnValue(Promise.resolve(predictionTensor));

    service.predictionObservable.subscribe(predictions => {
      expect(tensorServiceCall).toHaveBeenCalledTimes(1);
      expect(predictWithWorkerSpy).toHaveBeenCalledTimes(1);
      expect(predictions).toEqual(expedctedPredictions);
      done();
    });
    service.predict();
  });

  it('#predict should reject if model is invalid', (done: DoneFn) => {
    const mockTensor = ones([1, 1, 1, 1]) as Tensor4D;
    const tensorServiceCall = tensorServiceSpy.convertToPredictTensors.withArgs(selectedChannels).and.returnValue(Promise.resolve(mockTensor));

    service.predict().then((ignored) => {
      done.fail('should not resolve');
    }).catch(reason => {
      expect(tensorServiceCall).toHaveBeenCalledTimes(1);
      expect(reason).toEqual(new Error('Uncaught SyntaxError: Unexpected token s in JSON at position 0'));
      done();
    });
  });
});
