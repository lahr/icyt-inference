import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {ImageComponent} from "./image/image.component";
import {HttpClientModule} from "@angular/common/http";
import {ControlComponent} from "./control/control.component";

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, ControlComponent, ImageComponent],
      imports: [HttpClientModule]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should contain 'icyt-tfjs' in title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toContain('icyt-tfjs');
  });
});
