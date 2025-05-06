import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal',
  standalone: false,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  @Input() foodName: string = '';  // For dynamic food name
  @Input() foodId: string = '';    // For dynamic food ID
  @Input() deleteProduct: Function = () => {};  // The deleteProduct function from parent component

  constructor(public activeModal: NgbActiveModal) {}

  // Method to call the deleteProduct passed from the parent component
  confirmDelete() {
    this.deleteProduct();  // Call the deleteProduct method
    this.activeModal.close();  // Close the modal after deletion
  }
}
