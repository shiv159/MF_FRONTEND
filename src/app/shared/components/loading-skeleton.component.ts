import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loading-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="animate-pulse space-y-4">
      <div *ngFor="let i of [].constructor(rows)" class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      <div class="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  `
})
export class LoadingSkeletonComponent {
    @Input() rows: number = 3;
}
