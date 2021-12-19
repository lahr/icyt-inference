import {TestBed} from '@angular/core/testing';

import * as base64 from 'base64-arraybuffer'

import {TensorService} from './tensor.service';
import {Tensor3D, tensor3d} from "@tensorflow/tfjs";
import {Tensor} from "@tensorflow/tfjs-core/dist/tensor";

describe('TensorService', () => {

  let service: TensorService;

  /** shape [2,3,2] */
  const tensor_a = tensor3d([[[0.6363636255264282, 1], [0.27272728085517883, 0.5], [0, 1]], [[1, 0.5], [0.1818181872367859, 0], [0.5454545617103577, 0.5]]])
  const buffer_a = base64.decode('SUkqAAgAAAAQAAABBAABAAAAAwAAAAEBBAABAAAAAgAAAAIBAwACAAAAEAAQAAMBAwABAAAAAQAAAAYBAwABAAAAAQAAAA4BAgAVAAAAzgAAABEBBAABAAAAEAEAABUBAwABAAAAAgAAABYBBAABAAAAAgAAABcBBAABAAAAGAAAABoBBQABAAAA9AAAABsBBQABAAAA/AAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAABAEAAFIBAwABAAAAAAAAAAAAAAB7InNoYXBlIjogWzIsIDMsIDJdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAyAw4ALgMNACsDDgA2Aw0ALQMMADEDDQA=')

  /** shape [3,4,2] */
  const tensor_b = tensor3d([[[0.5625, 0.5], [0.5625, 0.75], [0, 0.25], [0.5625, 0.25]], [[0.75, 0.5], [0.1875, 1], [0.25, 0.5], [0.5, 0]], [[0.625, 0.5], [0.25, 1], [0.625, 0.75], [1, 0.25]]])
  const buffer_b = base64.decode('SUkqAAgAAAAQAAABBAABAAAABAAAAAEBBAABAAAAAwAAAAIBAwACAAAAEAAQAAMBAwABAAAAAQAAAAYBAwABAAAAAQAAAA4BAgAVAAAAzgAAABEBBAABAAAAEAEAABUBAwABAAAAAgAAABYBBAABAAAAAwAAABcBBAABAAAAMAAAABoBBQABAAAA9AAAABsBBQABAAAA/AAAABwBAwABAAAAAQAAACgBAwABAAAAAQAAADEBAgAMAAAABAEAAFIBAwABAAAAAAAAAAAAAAB7InNoYXBlIjogWzMsIDQsIDJdfQAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAB0aWZmZmlsZS5weQAvAwwALwMNACYDCwAvAwsAMgMMACkDDgAqAwwALgMKADADDAAqAw4AMAMNADYDCwA=')

  /** shape [3,4,3] */
  const tensor_c = tensor3d([[[0.5625, 0.5, 1], [0.5625, 0.75, 0.5], [0, 0.25, 0.75], [0.5625, 0.25, 1]], [[0.75, 0.5, 0.5], [0.1875, 1, 0], [0.25, 0.5, 0.5], [0.5, 0, 1]], [[0.625, 0.5, 0.25], [0.25, 1, 0], [0.625, 0.75, 0.75], [1, 0.25, 0.5]]])
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
