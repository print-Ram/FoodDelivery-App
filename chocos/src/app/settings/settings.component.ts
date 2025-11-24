import { Component, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../service/auth/auth.service';
import { User } from '../models/user';
@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

    user: User = {};
    constructor(
        private authService: AuthService,
      ){}

  ngOnInit(): void {
  const userId = this.authService.getUserId();
  if (userId) {
    this.authService.getUserById(userId).subscribe(u => this.user = u);
  }
}


fields: { key: keyof User; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'password', label: 'Password' },
    { key: 'contact', label: 'Contact' }
  ];

flipped: { [key: string]: boolean } = {};

  toggleFlip(key: string) {
    this.flipped[key] = !this.flipped[key];
  }
  
  showToast = false;
  toastMessage = '';
updateUser(): void {
    if (this.user && this.user.user_id) {
      this.authService.updateUser(this.user.user_id, this.user).subscribe(() => {
        this.showToastMessage('✅ Profile updated successfully!');
      });
    } else {
      this.showToastMessage('❌ User ID is missing. Cannot update profile.');
    }
  }

  private showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000);
  }

showPassword = false;

togglePasswordVisibility(event: MouseEvent): void {
  event.stopPropagation(); // Prevent flipping the card
  this.showPassword = !this.showPassword;
}


}
