import { Component, ChangeDetectionStrategy, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'search';

@Component({
    selector: 'ui-input',
    imports: [CommonModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ],
    template: `
    <div class="space-y-1.5">
      @if (label()) {
        <label [for]="inputId" class="block text-sm font-medium text-secondary">
          {{ label() }}
          @if (required()) {
            <span class="text-error">*</span>
          }
        </label>
      }
      
      <div class="relative">
        @if (icon()) {
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <ng-content select="[slot=icon]"></ng-content>
          </div>
        }
        
        <input
          [id]="inputId"
          [type]="currentType"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [(ngModel)]="value"
          (blur)="onTouched()"
          (input)="onInput()"
          [class]="inputClasses"
          [autocomplete]="autocomplete()"
        >
        
        @if (type() === 'password') {
          <button
            type="button"
            (click)="togglePassword()"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-secondary transition-colors"
            tabindex="-1"
          >
            @if (showPassword) {
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            } @else {
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            }
          </button>
        }
      </div>
      
      @if (error()) {
        <p class="text-sm text-error">{{ error() }}</p>
      }
      
      @if (hint() && !error()) {
        <p class="text-sm text-muted">{{ hint() }}</p>
      }
    </div>
  `
})
export class InputComponent implements ControlValueAccessor {
    readonly type = input<InputType>('text');
    readonly label = input<string>('');
    readonly placeholder = input<string>('');
    readonly hint = input<string>('');
    readonly error = input<string>('');
    readonly disabled = input(false);
    readonly readonly = input(false);
    readonly required = input(false);
    readonly icon = input(false);
    readonly autocomplete = input<string>('off');

    value = '';
    showPassword = false;
    private static idCounter = 0;
    readonly inputId = `ui-input-${++InputComponent.idCounter}`;

    onChange: (value: string) => void = () => { };
    onTouched: () => void = () => { };

    get currentType(): string {
        if (this.type() === 'password') {
            return this.showPassword ? 'text' : 'password';
        }
        return this.type();
    }

    get inputClasses(): string {
        const base = 'w-full bg-surface border rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
        const withIcon = this.icon() ? 'pl-10' : '';
        const withPassword = this.type() === 'password' ? 'pr-10' : '';
        const stateClasses = this.error()
            ? 'border-error focus:ring-error'
            : 'border-default hover:border-slate-300 dark:hover:border-slate-600';
        const disabledClasses = this.disabled() ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : '';

        return `${base} ${withIcon} ${withPassword} ${stateClasses} ${disabledClasses}`;
    }

    togglePassword(): void {
        this.showPassword = !this.showPassword;
    }

    onInput(): void {
        this.onChange(this.value);
    }

    writeValue(value: string): void {
        this.value = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        // Handled via input signal
    }
}
