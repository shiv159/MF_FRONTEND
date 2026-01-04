import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RiskProfileService } from '../services/risk-profile.service';
import { StepperComponent } from '../../../shared/components/stepper.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';
import { ThemeToggleComponent } from '../../../shared/components/ui/theme-toggle.component';
import { RiskProfileResponse } from '../../../core/models/api.interface';
import { ChatService } from '../../chat/services/chat.service';

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
export class RiskProfileComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly service = inject(RiskProfileService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly chatService = inject(ChatService);

  currentStep = 0;
  isCompleted = false;
  isLoading = false;
  resultData: RiskProfileResponse | null = null;

  readonly stepLabels = ['Demographics', 'Financials', 'Goals', 'Behavioral', 'Preferences'];

  constructor() {
    this.chatService.isVisible.set(false);
  }

  goBack(): void {
    this.chatService.isVisible.set(false);
    this.router.navigate(['/landing']);
  }

  ngOnDestroy(): void {
    this.chatService.isVisible.set(false);
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
        this.chatService.isVisible.set(true);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Submission failed', err);
        this.isLoading = false;
        this.isCompleted = false;
        this.cdr.markForCheck();
      }
    });
  }
}
