import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'ui-button',
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
    readonly variant = input<ButtonVariant>('primary');
    readonly size = input<ButtonSize>('md');
    readonly type = input<'button' | 'submit' | 'reset'>('button');
    readonly disabled = input(false);
    readonly loading = input(false);
    readonly fullWidth = input(false);

    readonly clicked = output<MouseEvent>();

    get buttonClasses(): string {
        const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variants: Record<ButtonVariant, string> = {
            primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
            secondary: 'bg-surface border border-default text-primary-brand hover:bg-surface-hover',
            ghost: 'bg-transparent text-primary-brand hover:bg-primary-50 dark:hover:bg-primary-900/20',
            destructive: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
        };

        const sizes: Record<ButtonSize, string> = {
            sm: 'px-3 py-1.5 text-sm rounded',
            md: 'px-4 py-2 text-sm rounded-lg',
            lg: 'px-6 py-3 text-base rounded-lg',
        };

        const width = this.fullWidth() ? 'w-full' : '';

        return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${width}`;
    }

    handleClick(event: MouseEvent): void {
        if (!this.disabled() && !this.loading()) {
            this.clicked.emit(event);
        }
    }
}
