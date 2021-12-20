import {TestBed} from '@angular/core/testing';

import * as base64 from 'base64-arraybuffer'

import {TensorService} from './tensor.service';
import {Tensor3D, tensor3d} from "@tensorflow/tfjs";
import {Tensor} from "@tensorflow/tfjs-core/dist/tensor";

describe('TensorService', () => {

  let service: TensorService;

  /** shape [2,3,2] */
  const tensor_a = tensor3d([[[818, 14], [814, 13], [811, 14]], [[822, 13], [813, 12], [817, 13]]])
  const buffer_a = base64.decode('SUkqAAgAAAAQAAABBAABAAAAAwAAAAEBBAABAAAAAgAAAAIBAwACAAAAEAAQAAMBAwABAAAAAQAAAAYBAwABAAAAAQAAAA4BAgAVAAAAzgAAABEBBAABAAAAEAEAABUBAwABAAAAAgAAABYBBAABAAAAAgAAABcBBAABAAAAGAAAABoBBQABAAAA9AAAABsBBQABAAAA/AAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAABAEAAFIBAwABAAAAAAAAAAAAAAB7InNoYXBlIjogWzIsIDMsIDJdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAyAw4ALgMNACsDDgA2Aw0ALQMMADEDDQA=')

  /** shape [3,4,2] */
  const tensor_b = tensor3d([[[815, 12], [815, 13], [806, 11], [815, 11]], [[818, 12], [809, 14], [810, 12], [814, 10]], [[816, 12], [810, 14], [816, 13], [822, 11]]])
  const buffer_b = base64.decode('SUkqAAgAAAAQAAABBAABAAAABAAAAAEBBAABAAAAAwAAAAIBAwACAAAAEAAQAAMBAwABAAAAAQAAAAYBAwABAAAAAQAAAA4BAgAVAAAAzgAAABEBBAABAAAAEAEAABUBAwABAAAAAgAAABYBBAABAAAAAwAAABcBBAABAAAAMAAAABoBBQABAAAA9AAAABsBBQABAAAA/AAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAABAEAAFIBAwABAAAAAAAAAAAAAAB7InNoYXBlIjogWzMsIDQsIDJdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAvAwwALwMNACYDCwAvAwsAMgMMACkDDgAqAwwALgMKADADDAAqAw4AMAMNADYDCwA=')

  /** shape [3,4,3] */
  const tensor_c = tensor3d([[[815, 12, 31], [815, 13, 29], [806, 11, 30], [815, 11, 31]], [[818, 12, 29], [809, 14, 27], [810, 12, 29], [814, 10, 31]], [[816, 12, 28], [810, 14, 27], [816, 13, 30], [822, 11, 29]]])
  const buffer_c = base64.decode('SUkqAAgAAAAPAAABBAABAAAABAAAAAEBBAABAAAAAwAAAAIBAwADAAAAwgAAAAMBAwABAAAAAQAAAAYBAwABAAAAAgAAAA4BAgAVAAAAyAAAABEBBAABAAAAEAEAABUBAwABAAAAAwAAABYBBAABAAAAAwAAABcBBAABAAAASAAAABoBBQABAAAA7gAAABsBBQABAAAA9gAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAA/gAAAAAAAAAQABAAEAB7InNoYXBlIjogWzMsIDQsIDNdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAAAAAAAAAvAwwAHwAvAw0AHQAmAwsAHgAvAwsAHwAyAwwAHQApAw4AGwAqAwwAHQAuAwoAHwAwAwwAHAAqAw4AGwAwAw0AHgA2AwsAHQA=')

  function tensorTester(a: any, b: any): boolean | void {
    if (a instanceof Tensor && b instanceof Tensor) {
      return a.equal(b).all().dataSync()[0] === 1
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

  it('#initializeTensors should create tensors from ArrayBuffers',
    (done: DoneFn) => {

      let tensors: Tensor3D[] = [tensor_a, tensor_b]
      const buffers = [buffer_a, buffer_b];

      service.tensorObservable.subscribe(result => {
        expect(result).toEqual(tensors);
        done();
      });
      service.initializeTensors(buffers);
    });

  it('#initializeTensors should throw error if number of channels not the same',
    (done: DoneFn) => {

      const buffers = [buffer_a, buffer_b, buffer_c];

      service.tensorObservable.subscribe(null, result => {
        expect(result).toEqual(new Error('Different channel numbers 2 and 3.'));
        done();
      });
      service.initializeTensors(buffers);
    });

  it('#convertToImageData should convert a tensor channel to a ImageData object',
    (done: DoneFn) => {

      let tensors: Tensor3D[] = [tensor_a, tensor_b]

      const imgA = new ImageData(new Uint8ClampedArray([162, 162, 162, 255, 70, 70, 70, 255, 0, 0, 0, 255, 255, 255, 255, 255, 46, 46, 46, 255, 139, 139, 139, 255]), 3, 2);
      const imgB = new ImageData(new Uint8ClampedArray([143, 143, 143, 255, 143, 143, 143, 255, 0, 0, 0, 255, 143, 143, 143, 255, 191, 191, 191, 255, 48, 48, 48, 255, 64, 64, 64, 255, 128, 128, 128, 255, 159, 159, 159, 255, 64, 64, 64, 255, 159, 159, 159, 255, 255, 255, 255, 255]), 4, 3);

      const imageData: ImageData[] = [imgA, imgB];
      Promise.all(service.convertToImageData(tensors, 0)).then(result => {
        expect(result).toEqual(imageData)
        done();
      })
    });
});
