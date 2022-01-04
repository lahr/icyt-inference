import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TensorService} from "../service/tensor.service";
import {ModelService} from "../service/model.service";
import {PredictService} from "../service/predict.service";
import {combineLatest, finalize} from "rxjs";
import {ImageService} from "../service/image.service";
import {ProgressSpinnerMode} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent implements OnInit {

  modelName: string = 'f93937c';

  loadModelDisabled: boolean = false;
  loadModelSpinnerValue: number = 0;
  loadModelSpinnerMode: ProgressSpinnerMode = 'determinate';
  loadModelInProgress: boolean = false;

  predictInProgress: boolean = false;
  predictDisabled: boolean = true;

  loadImagesDisabled: boolean = false;
  loadImagesInProgress: boolean = false;

  @ViewChild('upload') uploadElement!: ElementRef;

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

  loadImages(event: any): void {
    this.loadImagesDisabled = true;
    this.loadImagesInProgress = true;
    const files: Array<File> = Array.from(event.target.files);
    this.imageService.loadImages(files)
      .then(buffers => this.tensorService.initializeTensors(buffers))
      .catch(error => {
        alert(error);
        this.loadImagesDisabled = false;
      }).finally(() => {
        this.loadImagesInProgress = false;
        this.uploadElement.nativeElement.value = '' //reset input
      }
    );
  }

  loadDemoImages(): void {
    this.loadImagesDisabled = true;
    this.loadImagesInProgress = true;
    this.imageService.loadDemoImages()
      .then(buffers => this.tensorService.initializeTensors(buffers))
      .catch(error => {
        alert(error)
        this.loadImagesDisabled = false;
      }).finally(() => this.loadImagesInProgress = false);
  }

  loadModel(): void {
    this.loadModelDisabled = true;
    this.loadModelInProgress = true;
    this.modelService.loadModel(this.modelName)
      .pipe(finalize(() => this.loadModelInProgress = false))
      .subscribe({
        next: progress => {
          if (progress === 100) {
            this.loadModelSpinnerMode = 'indeterminate';
          }
          this.loadModelSpinnerValue = progress;
        },
        error: error => {
          alert(error);
          this.loadModelDisabled = false;
        }
      });
  }

  predict(): void {
    this.predictDisabled = true;
    this.predictInProgress = true;
    this.predictService.predict()
      .catch(error => {
        alert(error);
        this.predictDisabled = false;
      })
      .finally(() => this.predictInProgress = false);
  }
}
