import {TestBed} from '@angular/core/testing';

import * as base64 from 'base64-arraybuffer'

import {TensorService} from './tensor.service';
import {ENV, getBackend, tensor3d} from "@tensorflow/tfjs";
import {Tensor} from "@tensorflow/tfjs-core/dist/tensor";

describe('TensorService', () => {

  let service: TensorService;

  /** shape [2,3,2] */
  const tensor_a = tensor3d([[[0.6363638043403625, 1], [0.2727276682853699, 0.4999997019767761], [0, 1]], [[1, 0.4999997019767761], [0.18181845545768738, 0], [0.5454546213150024, 0.4999997019767761]]]);
  const buffer_a = base64.decode('SUkqAAgAAAAQAAABBAABAAAAAwAAAAEBBAABAAAAAgAAAAIBAwACAAAAEAAQAAMBAwABAAAAAQAAAAYBAwABAAAAAQAAAA4BAgAVAAAAzgAAABEBBAABAAAAEAEAABUBAwABAAAAAgAAABYBBAABAAAAAgAAABcBBAABAAAAGAAAABoBBQABAAAA9AAAABsBBQABAAAA/AAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAABAEAAFIBAwABAAAAAAAAAAAAAAB7InNoYXBlIjogWzIsIDMsIDJdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAyAw4ALgMNACsDDgA2Aw0ALQMMADEDDQA=');
  const imageData_a = new ImageData(new Uint8ClampedArray([162, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);

  /** shape [3,4,2] */
  const tensor_b = tensor3d([[[0.5624998211860657, 0.5000001788139343], [0.5624998211860657, 0.7499999403953552], [0, 0.25000008940696716], [0.5624998211860657, 0.25000008940696716]], [[0.7500001192092896, 0.5000001788139343], [0.18750028312206268, 1], [0.25000038743019104, 0.5000001788139343], [0.5000002384185791, 0]], [[0.6249999403953552, 0.5000001788139343], [0.25000038743019104, 1], [0.6249999403953552, 0.7499999403953552], [1, 0.25000008940696716]]]);
  const buffer_b = base64.decode('SUkqAAgAAAAQAAABBAABAAAABAAAAAEBBAABAAAAAwAAAAIBAwACAAAAEAAQAAMBAwABAAAAAQAAAAYBAwABAAAAAQAAAA4BAgAVAAAAzgAAABEBBAABAAAAEAEAABUBAwABAAAAAgAAABYBBAABAAAAAwAAABcBBAABAAAAMAAAABoBBQABAAAA9AAAABsBBQABAAAA/AAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAABAEAAFIBAwABAAAAAAAAAAAAAAB7InNoYXBlIjogWzMsIDQsIDJdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAvAwwALwMNACYDCwAvAwsAMgMMACkDDgAqAwwALgMKADADDAAqAw4AMAMNADYDCwA=');
  const imageData_b = new ImageData(new Uint8ClampedArray([143, 143, 143, 255, 143, 143, 143, 255, 0, 0, 0, 255, 143, 143, 143, 255, 191, 191, 191, 255, 48, 48, 48, 255, 64, 64, 64, 255, 128, 128, 128, 255, 159, 159, 159, 255, 64, 64, 64, 255, 159, 159, 159, 255, 255, 255, 255, 255]), 4, 3);

  /** shape [3,4,3] */
  const buffer_c = base64.decode('SUkqAAgAAAAPAAABBAABAAAABAAAAAEBBAABAAAAAwAAAAIBAwADAAAAwgAAAAMBAwABAAAAAQAAAAYBAwABAAAAAgAAAA4BAgAVAAAAyAAAABEBBAABAAAAEAEAABUBAwABAAAAAwAAABYBBAABAAAAAwAAABcBBAABAAAASAAAABoBBQABAAAA7gAAABsBBQABAAAA9gAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAA/gAAAAAAAAAQABAAEAB7InNoYXBlIjogWzMsIDQsIDNdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAAAAAAAAAvAwwAHwAvAw0AHQAmAwsAHgAvAwsAHwAyAwwAHQApAw4AGwAqAwwAHQAuAwoAHwAwAwwAHAAqAw4AGwAwAw0AHgA2AwsAHQA=')

  const cut = (value: any, precision: number = 6) => parseFloat(value).toPrecision(precision);

  function tensorTester(a: any, b: any): boolean | void {
    /*
    Precision issues with float32 tensor values and different backends (webgl, cpu)
    otherwise `a.equal(b).all().dataSync()[0] === 1` would suffice
    https://www.tensorflow.org/js/guide/platform_environment#precision
    Avoiding `setBackend('cpu')` in web worker with this solution
     */
    if (a instanceof Tensor && b instanceof Tensor) {
      const aData = a.dataSync();
      const bData = b.dataSync();
      return a.shape.every((value: number, index: number) => value === b.shape[index])
        && aData.every((value: number, index: number) => cut(value) === cut(bData[index]));
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TensorService);
    jasmine.addCustomEqualityTester(tensorTester)
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('#initializeTensors should create tensors from ArrayBuffers', (done: DoneFn) => {
    console.log('Backend: ' + getBackend());
    console.log(ENV.features);
    const tensors = [tensor_a, tensor_b];

    const buffers = [buffer_a, buffer_b];
    service.initializeTensors(buffers).then(ignored => {
      expect((<any>service).tensors).toEqual(tensors);
      done();
    });
  });

  it('#initializeTensors should emit the number of channels', (done: DoneFn) => {
    const buffers = [buffer_a];
    service.channelObservable.subscribe(numChannels => {
      expect(numChannels).toBe(2);
      done();
    });
    service.initializeTensors(buffers);
  });

  it('#initializeTensors should throw error if number of channels not the same', (done: DoneFn) => {
    const buffers = [buffer_a, buffer_b, buffer_c];
    service.initializeTensors(buffers)
      .then(ignored => done.fail('should never complete'))
      .catch(error => {
        expect(error).toEqual(new Error('Different channel numbers 2 and 3.'));
        done();
      });
  });

  it('#initializeTensors should throw error if ArrayBuffers invalid',
    (done: DoneFn) => {
      const buffers = [new ArrayBuffer(0)];
      service.initializeTensors(buffers)
        .then(ignored => done.fail('should never complete'))
        .catch(error => {
          expect(error).toEqual(new Error('Uncaught RangeError: Offset is outside the bounds of the DataView'));
          done();
        });
    });

  it('#convertToImageData should convert a tensor channel to a ImageData object',
    (done: DoneFn) => {
      const imageData: ImageData[] = [imageData_a, imageData_b];
      service.initializeTensors([buffer_a, buffer_b]).then(ignored => {
        Promise.all(service.convertToImageData(1)).then(result => {
          expect(result).toEqual(imageData)
          done();
        });
      });
    });

  it('#convertToPredictTensors should convert list of 3D tensors to one 4D tensor', (done: DoneFn) => {
    service.initializeTensors([buffer_a, buffer_b]).then(ignored => {
      service.convertToPredictTensors([2]).then(result => {
        expect(result.shape).toEqual([2, 224, 224, 1]);
        done()
      });
    });
  });

  it('#convertToPredictTensors should fail if no channel is selected', (done: DoneFn) => {
    const emptySelectedChannels: number[] = [];
    service.initializeTensors([buffer_a, buffer_b]).then(ignored => {
      service.convertToPredictTensors(emptySelectedChannels).then(ignored => {
        done.fail('should not complete');
      }).catch(error => {
        expect(error).toEqual(new Error('Uncaught Error: selectedChannels must not be empty'));
        done();
      });
    });
  });
});
