import {Component, OnInit} from '@angular/core';
import {ModelService} from "../model.service";
import {PredictService} from "../predict.service";
import {Predictions} from "../predictions";

@Component({
  selector: 'app-predict',
  templateUrl: './predict.component.html',
  styleUrls: ['./predict.component.scss']
})
export class PredictComponent implements OnInit {

  disabled: boolean = true;
  predictions: Predictions[] = [];

  constructor(private modelService: ModelService,
              private predictService: PredictService) {
  }

  ngOnInit(): void {
    this.modelService.modelObservable.subscribe(ignored => {
      this.disabled = false;
    })
  }

  predict(): void {
    this.disabled = true;
    this.predictService.predict().then(predictions => this.predictions = predictions);
  }
}
