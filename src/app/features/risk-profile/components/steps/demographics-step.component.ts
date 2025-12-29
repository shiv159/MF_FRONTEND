import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskProfileService } from '../../services/risk-profile.service';

@Component({
  selector: 'app-demographics-step',
  imports: [CommonModule, FormsModule],
  templateUrl: './demographics-step.component.html',
  styleUrl: './demographics-step.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemographicsStepComponent {
  private readonly service = inject(RiskProfileService);
  readonly next = output<void>();

  data = {
    age: 0,
    incomeRange: '',
    dependents: 0
  };

  incomeRanges = [
    { value: 'BELOW_5L', label: 'Below ₹5 Lakhs' },
    { value: '5L_10L', label: '₹5L - ₹10L' },
    { value: '10L_25L', label: '₹10L - ₹25L' },
    { value: '25L_50L', label: '₹25L - ₹50L' },
    { value: 'ABOVE_50L', label: 'Above ₹50 Lakhs' }
  ];

  constructor() {
    const current = this.service.getCurrentState().demographics;
    if (current.age) this.data.age = current.age;
    if (current.incomeRange) this.data.incomeRange = current.incomeRange;
    if (current.dependents) this.data.dependents = current.dependents;
  }

  adjustDependents(delta: number): void {
    const newVal = this.data.dependents + delta;
    if (newVal >= 0 && newVal <= 10) {
      this.data.dependents = newVal;
    }
  }

  isValid(): boolean {
    return !!(this.data.age && this.data.age >= 18 && this.data.incomeRange);
  }

  onNext(): void {
    if (this.isValid()) {
      this.service.updateSection('demographics', this.data);
      this.next.emit();
    }
  }
}
