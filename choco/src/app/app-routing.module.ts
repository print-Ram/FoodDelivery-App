import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { ProductsComponent } from './products/products.component';
import { CartComponent } from './cart/cart.component';


const routes: Routes = [
  { path: '', component:ProductsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'cart', component:CartComponent }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
