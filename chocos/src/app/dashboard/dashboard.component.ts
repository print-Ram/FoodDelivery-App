import { Component } from '@angular/core';
import { Foods } from '../models/food';
import { FoodService } from '../service/food/food.service';
import { CartService } from '../service/cart/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
