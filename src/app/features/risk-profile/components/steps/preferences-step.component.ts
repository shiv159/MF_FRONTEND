import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskProfileService } from '../../services/risk-profile.service';

@Component({
  selector: 'app-preferences-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in-up">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Investment Preferences</h3>

      <!-- Style -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Investment Style</label>
        <div class="grid grid-cols-2 gap-4">
          <div (click)="data.preferredInvestmentStyle = 'PASSIVE'" 
               [class]="'p-4 rounded-xl border-2 cursor-pointer transition-all ' + (data.preferredInvestmentStyle === 'PASSIVE' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50')">
             <div class="font-bold text-green-700">Passive (Index Funds)</div>
             <p class="text-xs text-gray-500 mt-1">Lower fees, market returns. "Set it and forget it".</p>
          </div>
          <div (click)="data.preferredInvestmentStyle = 'ACTIVE'" 
               [class]="'p-4 rounded-xl border-2 cursor-pointer transition-all ' + (data.preferredInvestmentStyle === 'ACTIVE' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50')">
             <div class="font-bold text-orange-700">Active (Fund Managers)</div>
             <p class="text-xs text-gray-500 mt-1">Goal to beat the market. Slightly higher fees.</p>
          </div>
        </div>
      </div>

      <!-- Tax Saving -->
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <span class="block font-bold text-gray-900">Tax Saving (ELSS)</span>
          <span class="text-sm text-gray-500">Do you need Section 80C deductions?</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" [(ngModel)]="data.taxSavingNeeded" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div class="pt-6 flex gap-4">
        <button (click)="back.emit()" class="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all">Back</button>
        <button [disabled]="isLoading" (click)="onSubmit()" class="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 flex items-center justify-center transition-all">
          <span *ngIf="!isLoading">Calculate Plan</span>
          <svg *ngIf="isLoading" class="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PreferencesStepComponent {
  data = { preferredInvestmentStyle: 'PASSIVE', taxSavingNeeded: false };
  @Output() submitForm = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  isLoading = false;

  constructor(private service: RiskProfileService) {
    const current = this.service.getCurrentState().preferences;
    if (current) this.data = { ...current };
  }

  onSubmit() {
    this.isLoading = true;
    this.service.updateSection('preferences', this.data);
    this.submitForm.emit();
  }
}
