import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
    selector: 'app-currency-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CurrencyInputComponent),
            multi: true
        },
        CurrencyPipe
    ],
    template: `
    <div class="relative rounded-md shadow-sm">
      <div class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
        <span class="text-gray-500 sm:text-sm">₹</span>
      </div>
      <input
        type="text"
        [id]="id"
        [class]="'block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ' + inputClass"
        [placeholder]="placeholder"
        [value]="formattedValue"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">INR</span>
      </div>
    </div>
  `
})
export class CurrencyInputComponent implements ControlValueAccessor {
    @Input() id: string = '';
    @Input() placeholder: string = '0.00';
    @Input() inputClass: string = '';

    innerValue: number | null = null;
    formattedValue: string = '';

    onChange: any = () => { };
    onTouched: any = () => { };

    constructor(private currencyPipe: CurrencyPipe) { }

    writeValue(value: number): void {
        this.innerValue = value;
        this.formatValue();
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    onInput(event: any) {
        const inputVal = event.target.value.replace(/[^0-9.]/g, '');
        this.innerValue = inputVal ? parseFloat(inputVal) : null;
        this.onChange(this.innerValue);
    }

    onBlur() {
        this.formatValue();
        this.onTouched();
    }

    onFocus() {
        // Show raw number on focus for easier editing
        this.formattedValue = this.innerValue !== null ? this.innerValue.toString() : '';
    }

    private formatValue() {
        if (this.innerValue !== null) {
            this.formattedValue = this.currencyPipe.transform(this.innerValue, 'INR', '', '1.0-0') || '';
        } else {
            this.formattedValue = '';
        }
    }
}
