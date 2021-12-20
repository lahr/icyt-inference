import {Component} from '@angular/core';
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  defaultTitle = 'icyt-tfjs';
  title = environment.production ? this.defaultTitle : `${this.defaultTitle} (DEV)`;
}
