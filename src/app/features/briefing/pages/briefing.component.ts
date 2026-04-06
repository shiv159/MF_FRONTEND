import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BriefingService } from '../services/briefing.service';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-briefing',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div class="max-w-3xl mx-auto">
        <div class="mb-8">
          <button (click)="goBack()" class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-2 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Briefings</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Your daily AI-generated portfolio insights</p>
        </div>

        @if (briefingService.isLoading()) {
          <div class="animate-pulse space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            }
          </div>
        } @else if (briefingService.briefings().length === 0) {
          <div class="text-center py-16">
            <p class="text-gray-400 dark:text-gray-500 text-lg">No briefings yet. Check back tomorrow morning!</p>
          </div>
        } @else {
          <div class="space-y-4">
            @for (briefing of briefingService.briefings(); track briefing.briefingId) {
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                   [class.border-l-4]="!briefing.isRead" [class.border-l-primary-500]="!briefing.isRead">
                <div class="p-6">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ briefing.title }}</h3>
                      <p class="text-xs text-gray-400 mt-1">{{ briefing.createdAt | date:'medium' }}</p>
                    </div>
                    @if (!briefing.isRead) {
                      <span class="px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">New</span>
                    }
                  </div>
                  <div class="prose prose-sm dark:prose-invert max-w-none">
                    <markdown [data]="briefing.content"></markdown>
                  </div>
                  @if (!briefing.isRead) {
                    <button (click)="briefingService.markAsRead(briefing.briefingId)"
                            class="mt-4 text-sm text-primary-500 hover:text-primary-600">Mark as read</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class BriefingComponent {
  briefingService = inject(BriefingService);

  constructor() {
    this.briefingService.loadBriefings();
  }

  goBack(): void {
    window.history.back();
  }
}
