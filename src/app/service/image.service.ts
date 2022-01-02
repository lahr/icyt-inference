import {Injectable} from '@angular/core';
import {forkJoin, lastValueFrom, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private static readonly ALLOWED_FILE_SUFFIXES: string[] = ['tif', 'tiff'];

  constructor(private http: HttpClient) {
  }

  loadImages(files: Array<File>): Promise<ArrayBuffer[]> {
    return Promise.all(files.map(file => {
      if (!ImageService.ALLOWED_FILE_SUFFIXES.includes(file.name.split('.').pop() || file.name)) {
        return Promise.reject(`Not a ${ImageService.ALLOWED_FILE_SUFFIXES.map(suffix => '.' + suffix).join(', ')} file: ${file.name}`);
      }
      return file.arrayBuffer();
    }));
  }

  loadDemoImages(): Promise<ArrayBuffer[]> {
    const basePath = 'assets/demo/';
    const images = ['demo-image-01-acer.pseudoplatanus.tif',
      'demo-image-02-corylus.avellana.tif',
      'demo-image-03-betula.pendula.tif',
      'demo-image-04-quercus.robur.tif'];

    return lastValueFrom(forkJoin(
      images.map(image => basePath + image)
        .map(path => this.fetchImage(path))));
  }

  private fetchImage(file: string): Observable<ArrayBuffer> {
    return this.http.get(file, {responseType: 'arraybuffer'});
  }
}
