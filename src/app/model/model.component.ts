import {Component, OnInit} from '@angular/core';
import {ModelService} from "../model.service";
import {AppSettings} from "../app-settings";

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit {

  modelName: string = 'f93937c';
  status?: string;

  constructor(private modelService: ModelService) {
  }

  ngOnInit(): void {
  }

  loadModel(event: any): void {
    event.target.disabled = true;
    this.modelService.loadModel(this.modelName).subscribe({
      next: progress => this.status = `Loading ... ${progress}%`,
      error: error => this.status = error,
      complete: () => this.status = `Model '${this.modelName}' loaded`
    });
  }
}
