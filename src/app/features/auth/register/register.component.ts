import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { AuthStore } from '../../../core/auth/store/auth.store';
import { ThemeToggleComponent } from '../../../shared/components/ui/theme-toggle.component';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly store = inject(AuthStore);
  protected readonly showPassword = signal(false);

  protected readonly registerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  protected onSubmit(): void {
    if (this.registerForm.valid) {
      const { fullName, email, phone, password } = this.registerForm.value;
      if (fullName && email && password) {
        this.authService.register({ fullName, email, phone: phone || undefined, password }).subscribe({
          next: () => this.router.navigate(['/']),
          error: () => { }
        });
      }
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
