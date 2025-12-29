import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ui-card',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div [class]="cardClasses">
      @if (title()) {
        <div class="mb-4">
          <h3 class="text-heading-md">{{ title() }}</h3>
          @if (subtitle()) {
            <p class="text-sm text-secondary mt-1">{{ subtitle() }}</p>
          }
        </div>
      }
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
    readonly title = input<string>('');
    readonly subtitle = input<string>('');
    readonly padding = input<'sm' | 'md' | 'lg'>('md');
    readonly hoverable = input(false);
    readonly clickable = input(false);

    get cardClasses(): string {
        const base = 'bg-surface border border-default rounded-xl shadow-sm transition-all';

        const paddings = {
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        const interactive = this.hoverable() || this.clickable()
            ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'
            : '';

        const cursor = this.clickable() ? 'cursor-pointer' : '';

        return `${base} ${paddings[this.padding()]} ${interactive} ${cursor}`;
    }
}
