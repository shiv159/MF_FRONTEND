import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/store/auth.store';
import { AuthService } from '../../core/auth/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/ui/theme-toggle.component';
import { ChatService } from '../chat/services/chat.service';
import { BriefingService } from '../briefing/services/briefing.service';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);
  protected readonly briefingService = inject(BriefingService);
  protected readonly store = inject(AuthStore);

  constructor() {
    this.chatService.setContext('LANDING', true);
    this.briefingService.loadUnreadCount();
  }

  protected navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  protected logout(): void {
    this.chatService.setContext('LANDING', false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
