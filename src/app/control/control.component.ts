import {Component, OnInit} from '@angular/core';
import {TensorService} from "../service/tensor.service";
import {ModelService} from "../service/model.service";
import {PredictService} from "../service/predict.service";
import {combineLatest, forkJoin, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnInit {

  modelName: string = 'f93937c';
  modelStatus?: string;
  predictDisabled: boolean = true;

  constructor(private tensorService: TensorService,
              private modelService: ModelService,
              private predictService: PredictService,
              private http: HttpClient) {
  }

  ngOnInit(): void {
    combineLatest([this.tensorService.channelObservable, this.modelService.modelObservable]).subscribe(ignored => {
      this.predictDisabled = false;
    });
  }

  loadDemoImages(event: any): void {
    event.target.disabled = true;

    const basePath = 'assets/demo/';
    const images = ['demo-image-01-acer.pseudoplatanus.tif',
      'demo-image-02-corylus.avellana.tif',
      'demo-image-03-betula.pendula.tif',
      'demo-image-04-quercus.robur.tif'];

    forkJoin(
      images.map(image => basePath + image)
        .map(path => this.fetchImage(path)))
      .subscribe(buffers => {
        this.tensorService.initializeTensors(buffers);
      });
  }

  private fetchImage(file: string): Observable<ArrayBuffer> {
    return this.http.get(file, {responseType: 'arraybuffer'});
  }

  loadModel(event: any): void {
    event.target.disabled = true;
    this.modelService.loadModel(this.modelName).subscribe({
      next: progress => this.modelStatus = `Loading ... ${progress}%`,
      error: error => this.modelStatus = error,
      complete: () => this.modelStatus = `Model '${this.modelName}' loaded`
    });
  }

  predict(): void {
    this.predictDisabled = true;
    this.predictService.predict();
  }

}
