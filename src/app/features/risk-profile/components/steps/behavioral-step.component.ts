import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskProfileService } from '../../services/risk-profile.service';

@Component({
  selector: 'app-behavioral-step',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in-up">
      <h3 class="text-2xl font-bold text-gray-800 mb-4">Psychology Check</h3>

      <!-- Market Drop Reaction -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">
          If your portfolio drops by 30% in a market crash, what would you do?
        </label>
        <div class="space-y-3">
          <div *ngFor="let option of options" 
               (click)="data.marketDropReaction = option.value"
               [class]="'p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ' + 
                        (data.marketDropReaction === option.value ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-100 hover:bg-gray-50')">
            <div>
              <div class="font-bold text-gray-900">{{ option.label }}</div>
              <div class="text-sm text-gray-500">{{ option.desc }}</div>
            </div>
            <div *ngIf="data.marketDropReaction === option.value" class="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Experience -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
        <select [(ngModel)]="data.investmentPeriodExperience" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="" disabled>Select experience</option>
          <option value="NONE">No Experience</option>
          <option value="<3_YEARS">Less than 3 Years</option>
          <option value="3-5_YEARS">3 - 5 Years</option>
          <option value=">5_YEARS">More than 5 Years</option>
        </select>
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
export class BehavioralStepComponent {
  data = { marketDropReaction: '', investmentPeriodExperience: '' };
  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  options = [
    { value: 'BUY_MORE', label: 'Buy More', desc: 'Cheap opportunity! I stick to the plan.' },
    { value: 'HOLD', label: 'Hold', desc: 'I do nothing and wait for recovery.' },
    { value: 'SELL_SOME', label: 'Sell Some', desc: 'I reduce exposure to feel safer.' },
    { value: 'PANIC_SELL', label: 'Sell Everything', desc: 'Exit to avoid further loss.' }
  ];

  constructor(private service: RiskProfileService) {
    const current = this.service.getCurrentState().behavioral;
    this.data = { ...current };
  }

  isValid(): boolean {
    return this.data.marketDropReaction !== '' && this.data.investmentPeriodExperience !== '';
  }

  onNext() {
    this.service.updateSection('behavioral', this.data);
    this.next.emit();
  }
}
