import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskProfileService } from '../../services/risk-profile.service';
import { CurrencyInputComponent } from '../../../../shared/components/currency-input.component';

@Component({
  selector: 'app-financials-step',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyInputComponent],
  template: `
    <div class="space-y-6 animate-fade-in-up">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Financial Health</h3>

      <!-- Emergency Fund -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Fund (Months of Expenses saved)</label>
        <input type="range" [(ngModel)]="data.emergencyFundMonths" min="0" max="24" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
        <div class="text-center font-bold text-blue-600 mt-2">{{ data.emergencyFundMonths }} Months</div>
      </div>

      <!-- Existing EMI -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Existing Monthly EMI</label>
        <app-currency-input [(ngModel)]="data.existingEmiForLoans" placeholder="0"></app-currency-input>
      </div>

      <!-- Financial Knowledge -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Financial Knowledge</label>
        <div class="grid grid-cols-3 gap-2">
          <button *ngFor="let level of ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']"
                  (click)="data.financialKnowledge = level"
                  [class]="'py-3 rounded-lg border font-medium text-sm transition-all ' + 
                           (data.financialKnowledge === level ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50')">
            {{ level }}
          </button>
        </div>
      </div>

      <!-- Monthly SIP -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Planned Monthly Investment (SIP)</label>
        <app-currency-input [(ngModel)]="data.monthlyInvestmentAmount" placeholder="Min 500"></app-currency-input>
         <p *ngIf="data.monthlyInvestmentAmount > 0 && data.monthlyInvestmentAmount < 500" class="text-red-500 text-sm mt-1">Minimum ₹500 required</p>
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
export class FinancialsStepComponent {
  data = { emergencyFundMonths: 6, existingEmiForLoans: 0, financialKnowledge: 'BEGINNER', monthlyInvestmentAmount: 0 };
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  constructor(private service: RiskProfileService) {
    const current = this.service.getCurrentState().financials;
    this.data = { ...current };
    if (!current.financialKnowledge) this.data.financialKnowledge = 'BEGINNER';
  }

  isValid(): boolean {
    return this.data.monthlyInvestmentAmount >= 500 && this.data.financialKnowledge !== '';
  }

  onNext() {
    this.service.updateSection('financials', this.data);
    this.next.emit();
  }
}
