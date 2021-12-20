import {Component, OnInit, Renderer2} from '@angular/core';
import {Tensor3D} from "@tensorflow/tfjs";
import {HttpClient} from "@angular/common/http";
import {forkJoin, Observable} from "rxjs";
import {TensorService} from "../tensor.service";

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  DEFAULT_CHANNEL = 0;
  visibleChannels: string[] = [];
  channels: number[] = [];
  disabled: boolean = false;
  tensors: Tensor3D[] = [];

  constructor(private tensorService: TensorService,
              private http: HttpClient,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.tensorService.tensorObservable.subscribe(tensors => {
      this.tensors = tensors;
      this.channels = Array.from(Array(this.tensors[0].shape[2]).keys());
      this.updateChannel(0);
    });
  }

  loadDemoImages(): void {
    this.disabled = true;
    const basePath = 'assets/demo/';
    const images = ['demo-image-01-acer.pseudoplatanus.tif',
      'demo-image-02-corylus.avellana.tif',
      'demo-image-03-betula.pendula.tif',
      'demo-image-04-quercus.robur.tif'];

    forkJoin(
      images.map(image => basePath + image)
        .map(path => this.fetchImage(path)))
      .subscribe(buffers => {
        this.tensorService.initializeTensors(buffers)
      });
  }

  private fetchImage(file: string): Observable<ArrayBuffer> {
    return this.http.get(file, {responseType: 'arraybuffer'});
  }

  updateChannel(channel: number) {
    this.tensorService.convertToImageData(this.tensors, channel)
      .forEach((promise, i) => promise.then(image => {
        const canvas = this.renderer.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(image, 0, 0);
        this.visibleChannels[i] = canvas.toDataURL();
      }))
  }
}