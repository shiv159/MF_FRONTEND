import { Component, ChangeDetectionStrategy, inject, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskProfileService } from '../../services/risk-profile.service';
import { DemographicsData } from '../../../../core/models/api.interface';

interface IncomeRangeOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-demographics-step',
  imports: [CommonModule, FormsModule],
  templateUrl: './demographics-step.component.html',
  styleUrl: './demographics-step.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemographicsStepComponent implements OnInit {
  private readonly service = inject(RiskProfileService);
  readonly next = output<void>();

  data: DemographicsData = {
    age: 0,
    incomeRange: '',
    dependents: 0
  };
  showErrors = false;

  readonly incomeRanges: IncomeRangeOption[] = [
    { value: 'BELOW_5L', label: 'Below ₹5 Lakhs' },
    { value: '5L_10L', label: '₹5L - ₹10L' },
    { value: '10L_25L', label: '₹10L - ₹25L' },
    { value: '25L_50L', label: '₹25L - ₹50L' },
    { value: 'ABOVE_50L', label: 'Above ₹50 Lakhs' }
  ];

  ngOnInit(): void {
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

  private getAgeValue(): number | null {
    return typeof this.data.age === 'number' && Number.isFinite(this.data.age) ? this.data.age : null;
  }

  isAgeMissing(): boolean {
    return this.getAgeValue() === null;
  }

  isAgeNonInteger(): boolean {
    const age = this.getAgeValue();
    return age !== null && !Number.isInteger(age);
  }

  isAgeOutOfRange(): boolean {
    const age = this.getAgeValue();
    return age !== null && (age < 18 || age > 100);
  }

  isAgeInvalid(): boolean {
    return this.isAgeMissing() || this.isAgeNonInteger() || this.isAgeOutOfRange();
  }

  isValid(): boolean {
    const age = this.getAgeValue();
    return age !== null && Number.isInteger(age) && age >= 18 && age <= 100 && !!this.data.incomeRange;
  }

  onNext(): void {
    if (!this.isValid()) {
      this.showErrors = true;
      return;
    }
    this.showErrors = false;
    this.service.updateDemographics(this.data);
    this.next.emit();
  }
}
