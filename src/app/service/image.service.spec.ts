import {TestBed} from '@angular/core/testing';

import {ImageService} from './image.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

describe('ImageService', () => {
  let service: ImageService;
  let httpMock: HttpTestingController;
  const [buffer1, buffer2, buffer3, buffer4] = Array(4).fill(new ArrayBuffer(0));

  function expectHttpCalls() {
    httpMock.expectOne('assets/demo/demo-image-01-acer.pseudoplatanus.tif').flush(buffer1);
    httpMock.expectOne('assets/demo/demo-image-02-corylus.avellana.tif').flush(buffer2);
    httpMock.expectOne('assets/demo/demo-image-03-betula.pendula.tif').flush(buffer3);
    httpMock.expectOne('assets/demo/demo-image-04-quercus.robur.tif').flush(buffer4);
    httpMock.verify();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule]});
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load images', (done: DoneFn) => {
    service.loadImages([new File([buffer2], 'test1.tiff'), new File([buffer3], 'test2.tiff')]).then(res => {
      expect(res).toEqual([buffer2, buffer3]);
      done();
    });
  });

  it('should reject files with wrong file suffix', (done: DoneFn) => {
    service.loadImages([new File([buffer2], 'test1.tiff'), new File([buffer3], 'test2.txt')])
      .then(ignored => done.fail('should not complete'))
      .catch(reason => {
        expect(reason).toEqual('Not a .tif, .tiff file: test2.txt');
        done();
      });
  });

  it('should load demo images', (done: DoneFn) => {
    service.loadDemoImages().then(res => {
      expect(res).toEqual([buffer1, buffer2, buffer3, buffer4]);
      done();
    });
    expectHttpCalls();
  });
})
;
