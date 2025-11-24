import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { CartComponent } from './cart/cart.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './admin/home.component';
import { OrderComponent } from './order/order.component';
import { HomeGuard } from './home.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountComponent } from './account/account.component';
import { SettingsComponent } from './settings/settings.component';
import { CouponComponent } from './coupon/coupon.component';

const routes: Routes = [
  { path: '', component:ProductsComponent,canActivate: [HomeGuard]},
  { path: 'about', component:DashboardComponent},
  { path: 'products/:category', component: ProductsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'coupons', component:CouponComponent },
  { path: 'admin', component: HomeComponent,canActivate: [AuthGuard]},
  { path: 'orders', component: OrderComponent },
  { path: 'user', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: CartComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'accounts', component: AccountComponent }

  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
