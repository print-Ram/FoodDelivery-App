import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { CartComponent } from './cart/cart.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './admin/home.component';
import { OrderComponent } from './order/order.component';

const routes: Routes = [
  { path: '', component: ProductsComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: HomeComponent,canActivate: [AuthGuard]},
  { path: 'orders', component: OrderComponent },
  { path: 'dashboard', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
