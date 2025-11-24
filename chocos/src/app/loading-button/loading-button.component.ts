import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-button',
  standalone: false,
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.css'
})
export class LoadingButtonComponent {
  @Input() isLoading: boolean = false;
  @Input() text: string = 'Submit';
  @Input() disabled: boolean = false;
}
