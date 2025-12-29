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
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Your Financial Goals</h3>

      <!-- Primary Goal -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
        <div class="grid grid-cols-2 gap-3">
          <button *ngFor="let goal of ['RETIREMENT', 'WEALTH_CREATION', 'HOME_BUYING', 'EDUCATION']"
                  (click)="data.primaryGoal = goal"
                  [class]="'py-4 rounded-lg border font-bold text-sm transition-all ' + 
                           (data.primaryGoal === goal ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'border-gray-200 text-gray-600 hover:bg-blue-50')">
            {{ goal.replace('_', ' ') }}
          </button>
        </div>
      </div>

      <!-- Time Horizon -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Time Horizon (Years)</label>
        <div class="relative">
          <input type="number" [(ngModel)]="data.timeHorizonYears" min="1" max="50" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 font-bold text-xl text-center">
        </div>
        <p *ngIf="data.timeHorizonYears < 3 && data.timeHorizonYears > 0" class="text-yellow-600 text-sm mt-1">Short term goals require safer investments.</p>
      </div>

      <!-- Target Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Target Corpus Amount</label>
        <app-currency-input [(ngModel)]="data.targetAmount" placeholder="e.g. 1 Cr"></app-currency-input>
      </div>

      <div class="pt-6 flex gap-4">
        <button (click)="back.emit()" class="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all">Back</button>
        <button [disabled]="!isValid()" (click)="onNext()" class="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all">Next</button>
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

  constructor(private service: RiskProfileService) {
    const current = this.service.getCurrentState().goals;
    this.data = { ...current };
    if (!current.primaryGoal) this.data.primaryGoal = 'WEALTH_CREATION';
    if (!current.timeHorizonYears) this.data.timeHorizonYears = 10;
  }

  isValid(): boolean {
    return this.data.primaryGoal !== '' && this.data.timeHorizonYears > 0 && this.data.targetAmount > 0;
  }

  onNext() {
    this.service.updateSection('goals', this.data);
    this.next.emit();
  }
}
