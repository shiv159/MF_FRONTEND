import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskProfileService } from '../../services/risk-profile.service';
import { CurrencyInputComponent } from '../../../../shared/components/currency-input.component';

@Component({
  selector: 'app-goals-step',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyInputComponent],
  template: `
    <div class="space-y-6 animate-fade-in-up">
      <h3 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4">Your Financial Goals</h3>

      <!-- Primary Goal -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Goal</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button *ngFor="let goal of ['RETIREMENT', 'WEALTH_CREATION', 'HOME_BUYING', 'EDUCATION']"
                  (click)="data.primaryGoal = goal"
                  [class]="'py-3 sm:py-4 rounded-lg border font-bold text-sm transition-all ' + 
                           (data.primaryGoal === goal ? 'bg-blue-600 text-white shadow-md transform scale-[1.02] sm:scale-105' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800')">
            {{ goal.replace('_', ' ') }}
          </button>
        </div>
      </div>

      <!-- Time Horizon -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Horizon (Years)</label>
        <div class="relative">
          <input
            type="number"
            [(ngModel)]="data.timeHorizonYears"
            min="1"
            max="50"
            [ngClass]="showErrors && (!data.timeHorizonYears || data.timeHorizonYears < 1 || data.timeHorizonYears > 50) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 font-bold text-lg sm:text-xl text-center bg-white dark:bg-gray-800 dark:text-white">
        </div>
        <p *ngIf="showErrors && (!data.timeHorizonYears || data.timeHorizonYears < 1 || data.timeHorizonYears > 50)" class="text-red-500 text-sm mt-1">Time horizon must be between 1 and 50</p>
        <p *ngIf="data.timeHorizonYears < 3 && data.timeHorizonYears > 0" class="text-yellow-600 text-sm mt-1">Short term goals require safer investments.</p>
      </div>

      <!-- Target Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Corpus Amount</label>
        <app-currency-input
          [(ngModel)]="data.targetAmount"
          placeholder="e.g. 1 Cr"
          [inputClass]="showErrors && (!data.targetAmount || data.targetAmount <= 0) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''">
        </app-currency-input>
        <p *ngIf="showErrors && (!data.targetAmount || data.targetAmount <= 0)" class="text-red-500 text-sm mt-1">Target amount is required</p>
      </div>

      <div class="pt-4 sm:pt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button (click)="back.emit()" class="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 sm:py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">Back</button>
        <button
          (click)="onNext()"
          [attr.aria-disabled]="!isValid()"
          [class.opacity-50]="!isValid()"
          [class.cursor-not-allowed]="!isValid()"
          class="flex-1 bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class GoalsStepComponent {
  data = { primaryGoal: '', timeHorizonYears: 0, targetAmount: 0 };
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  showErrors = false;

  constructor(private service: RiskProfileService) {
    const current = this.service.getCurrentState().goals;
    this.data = { ...current };
    if (!current.primaryGoal) this.data.primaryGoal = 'WEALTH_CREATION';
    if (!current.timeHorizonYears) this.data.timeHorizonYears = 10;
  }

  isValid(): boolean {
    return this.data.primaryGoal !== '' && this.data.timeHorizonYears >= 1 && this.data.timeHorizonYears <= 50 && this.data.targetAmount > 0;
  }

  onNext() {
    if (!this.isValid()) {
      this.showErrors = true;
      return;
    }
    this.showErrors = false;
    this.service.updateSection('goals', this.data);
    this.next.emit();
  }
}
