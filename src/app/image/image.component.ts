import {Component, OnInit, Renderer2} from '@angular/core';
import {TensorService} from "../service/tensor.service";
import {ModelService} from "../service/model.service";
import {PredictService} from "../service/predict.service";
import {Predictions} from "../domain/predictions";

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
  selectedChannels: number[] = [];
  predictions: Predictions[] = [];

  constructor(private tensorService: TensorService,
              private modelService: ModelService,
              private predictService: PredictService,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.tensorService.channelObservable.subscribe(numChannels => {
      this.channels = Array.from({length: numChannels}, (_, i) => i + 1);
      this.updateChannel(1);
    });
    this.modelService.modelObservable
      .subscribe(([ignored, selectedChannels]) => this.selectedChannels = selectedChannels);
    this.predictService.predictionObservable.subscribe(predictions => this.predictions = predictions);
  }

  updateChannel(channel: number) {
    this.tensorService.convertToImageData(channel)
      .forEach((promise, i) => promise.then(image => {
        const canvas = this.renderer.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(image, 0, 0);
        this.visibleChannels[i] = canvas.toDataURL();
      }));
  }
}
