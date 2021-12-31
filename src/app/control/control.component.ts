import {Component, OnInit} from '@angular/core';
import {TensorService} from "../service/tensor.service";
import {ModelService} from "../service/model.service";
import {PredictService} from "../service/predict.service";
import {combineLatest} from "rxjs";
import {ImageService} from "../service/image.service";

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnInit {

  modelName: string = 'f93937c';
  loadStatus?: string;
  modelStatus?: string;
  predictStatus?: string;
  predictDisabled: boolean = true;

  constructor(private imageService: ImageService,
              private tensorService: TensorService,
              private modelService: ModelService,
              private predictService: PredictService) {
  }

  ngOnInit(): void {
    combineLatest([this.tensorService.channelObservable, this.modelService.modelObservable]).subscribe(ignored => {
      this.predictDisabled = false;
    });
  }

  loadDemoImages(event: any): void {
    event.target.disabled = true;
    this.imageService.loadDemoImages()
      .then(buffers => this.tensorService.initializeTensors(buffers))
      .then(() => this.loadStatus = 'Demo images loaded')
      .catch(error => this.loadStatus = error);
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
    this.predictService.predict().then(() => this.predictStatus = 'Images classified')
      .catch(error => this.predictStatus = error);
  }
}
