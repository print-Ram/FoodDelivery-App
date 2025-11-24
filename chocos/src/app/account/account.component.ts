import { Component } from '@angular/core';
import { AuthService } from '../service/auth/auth.service';
import { User } from '../models/user';

@Component({
  selector: 'app-account',
  standalone: false,
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent {

  selectedUser: User = {
  user_id: '',
  name: '',
  email: '',
  address: '',
  contact: '',
  password: ''
};
  isLoggedIn = false;

  constructor(private authService: AuthService){}

  ngOnInit(): void {
  this.isLoggedIn = this.authService.isAuthenticated();
  console.log('Is logged in:', this.isLoggedIn); // Debug login status

  if (this.isLoggedIn) {
    const userId = this.authService.getUserId();
    console.log('User ID from token:', userId); // Debug token user ID

    if (userId) {
      this.authService.getUserById(userId).subscribe(user => {
        this.selectedUser = user;
        console.log('Fetched user:', user); // Debug actual user data
      }, error => {
        console.error('Error fetching user:', error);
      });
    }
  }
}



}
