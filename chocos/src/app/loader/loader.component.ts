import { Component, Input } from '@angular/core';
import { LoadingService } from '../loading.service';
import { HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: false,
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {

  // @Input() message: string = 'Loading...';
  private requests = 0;
  constructor(public loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requests++;
    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => {
        this.requests--;
        if (this.requests === 0) {
          this.loadingService.hide();
        }
      })
    );
  }


}
