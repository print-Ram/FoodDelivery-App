import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { CartComponent } from './cart/cart.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './admin/home.component';
import { ProductsComponent } from './products/products.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RegisterComponent } from './register/register.component';
import { OrderComponent } from './order/order.component';
import { AuthInterceptor } from './interceptor/authinterceptor';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoadingButtonComponent } from './loading-button/loading-button.component';
import { LoaderComponent } from './loader/loader.component';
import { AccountComponent } from './account/account.component';
import { SettingsComponent } from './settings/settings.component';
import { CouponComponent } from './coupon/coupon.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    CartComponent,
    LoginComponent,
    HomeComponent,
    ProductsComponent,
    RegisterComponent,
    OrderComponent,
    DashboardComponent,
    LoadingButtonComponent,
    LoaderComponent,
    AccountComponent,
    SettingsComponent,
    CouponComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    NgbModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } ],
  bootstrap: [AppComponent]
})
export class AppModule { }