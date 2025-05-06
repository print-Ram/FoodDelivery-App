import { Component, OnInit } from '@angular/core';
import { FoodService } from '../service/food/food.service';
import { Foods } from '../models/food';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], // fixed typo: should be "styleUrls"
})
export class HomeComponent implements OnInit {
  foods: Foods[] = [];
  newProduct: Foods = {
    product_id: '',
    name: '',
    price: 0,
    imageurl: '',
    description: '',
  };
  showAddForm: boolean = false;
  showProductCards: boolean = false;
  showProducts: boolean = true;
  constructor(private fs: FoodService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.fs.getAll().subscribe({
      next: (data) => (this.foods = data),
      error: (err) => console.error('Error fetching food data:', err),
    });
  }

  addProduct(): void {
    this.fs.addProduct(this.newProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.resetForm();
      },
      error: (err) => console.error('Error adding product:', err),
    });
  }

  deleteProduct(product_id: string): void {
    this.fs.deleteProduct(product_id).subscribe({
      next: (response) => {
        console.log("Delete response:", response);  // Logs the response, e.g., "Product with product_id 123 deleted."
        this.loadProducts();  // Reload products after deletion
      },
      error: (err) => {
        console.error('Error deleting product:', err);  // Handles error cases
      },
    });
  }
  

  resetForm(): void {
    this.newProduct = {
      product_id: '',
      name: '',
      price: 0,
      imageurl: '',
      description: '',
    };
  }
  toggleAddForm(): void {
    this.showAddForm = true;
    this.showProductCards = false;
    this.showProducts = false;
  }

  toggleDeleteView(): void {
    this.showProductCards = true;
    this.showAddForm = false;
    this.showProducts = false;
  }

  // Method to open the confirmation modal
  openDeleteModal(food: any) {
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.foodName = food.name;
    modalRef.componentInstance.foodId = food.product_id;

    // Pass the deleteProduct function to the modal
    modalRef.componentInstance.deleteProduct = () => {
      this.deleteProduct(food.product_id);  // Call deleteProduct with the food product_id
      modalRef.close();  // Close the modal after deletion
    };
  }



}
