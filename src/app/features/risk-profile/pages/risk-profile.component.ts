import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RiskProfileService } from '../services/risk-profile.service';
import { StepperComponent } from '../../../shared/components/stepper.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { ThemeToggleComponent } from '../../../shared/components/ui/theme-toggle.component';

// Steps
import { DemographicsStepComponent } from '../components/steps/demographics-step.component';
import { FinancialsStepComponent } from '../components/steps/financials-step.component';
import { GoalsStepComponent } from '../components/steps/goals-step.component';
import { BehavioralStepComponent } from '../components/steps/behavioral-step.component';
import { PreferencesStepComponent } from '../components/steps/preferences-step.component';

// Result
import { RiskResultComponent } from '../components/results/risk-result.component';

@Component({
  selector: 'app-risk-profile',
  imports: [
    CommonModule,
    StepperComponent,
    LoadingSkeletonComponent,
    ThemeToggleComponent,
    DemographicsStepComponent,
    FinancialsStepComponent,
    GoalsStepComponent,
    BehavioralStepComponent,
    PreferencesStepComponent,
    RiskResultComponent
  ],
  templateUrl: './risk-profile.component.html',
  styleUrl: './risk-profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskProfileComponent {
  private readonly router = inject(Router);
  private readonly service = inject(RiskProfileService);

  currentStep = 0;
  isCompleted = false;
  isLoading = false;
  resultData: any = null;

  stepLabels = ['Demographics', 'Financials', 'Goals', 'Behavioral', 'Preferences'];

  goBack(): void {
    this.router.navigate(['/']);
  }

  nextStep(): void {
    if (this.currentStep < this.stepLabels.length - 1) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submitProfile(): void {
    this.isLoading = true;
    this.isCompleted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.service.submitProfile().subscribe({
      next: (response) => {
        this.resultData = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Submission failed', err);
        this.isLoading = false;
        this.isCompleted = false;
      }
    });
  }
}
