import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/store/auth.store';
import { AuthService } from '../../core/auth/services/auth.service';
import { ThemeToggleComponent } from '../../shared/components/ui/theme-toggle.component';
import { ChatService } from '../chat/services/chat.service';

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
  protected readonly store = inject(AuthStore);
  protected readonly taskLaunchers = [
    { label: 'Explain', prompt: 'Analyze my portfolio and tell me the top issue' },
    { label: 'Diagnose', prompt: 'My portfolio looks too aggressive' },
    { label: 'Compare', prompt: 'Compare these two funds for my profile' },
    { label: 'Simulate', prompt: 'What if I move 10% to debt?' },
    { label: 'Data Quality', prompt: 'What data in my portfolio is stale or incomplete?' }
  ];

  constructor() {
    this.chatService.setContext('LANDING', true);
  }

  protected navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  protected launchTask(prompt: string): void {
    this.chatService.launchPrompt(prompt, 'LANDING');
  }

  protected logout(): void {
    this.chatService.setContext('LANDING', false);
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
