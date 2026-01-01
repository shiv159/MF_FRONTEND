import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    RiskProfileRequest,
    RiskProfileResponse,
    DemographicsData,
    FinancialsData,
    BehavioralData,
    GoalsData,
    PreferencesData
} from '../../../core/models/api.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RiskProfileService {
    private readonly apiUrl = `${environment.apiUrl}/api/onboarding/risk-profile`;

    // State Management for the Wizard
    private profileState: RiskProfileRequest = {
        demographics: { age: 0, incomeRange: '', dependents: 0 },
        financials: { emergencyFundMonths: 0, existingEmiForLoans: 0, financialKnowledge: '', monthlyInvestmentAmount: 0 },
        behavioral: { marketDropReaction: '', investmentPeriodExperience: '' },
        goals: { primaryGoal: '', timeHorizonYears: 0, targetAmount: 0 },
        preferences: { preferredInvestmentStyle: 'PASSIVE', taxSavingNeeded: false }
    };

    private readonly stateSubject = new BehaviorSubject<RiskProfileRequest>(this.profileState);
    readonly state$ = this.stateSubject.asObservable();

    constructor(private readonly http: HttpClient) { }

    updateState(partial: Partial<RiskProfileRequest>): void {
        this.profileState = { ...this.profileState, ...partial };
        this.stateSubject.next(this.profileState);
    }

    // Helper to update nested objects with proper typing
    updateDemographics(data: Partial<DemographicsData>): void {
        this.profileState = {
            ...this.profileState,
            demographics: { ...this.profileState.demographics, ...data }
        };
        this.stateSubject.next(this.profileState);
    }

    updateFinancials(data: Partial<FinancialsData>): void {
        this.profileState = {
            ...this.profileState,
            financials: { ...this.profileState.financials, ...data }
        };
        this.stateSubject.next(this.profileState);
    }

    updateBehavioral(data: Partial<BehavioralData>): void {
        this.profileState = {
            ...this.profileState,
            behavioral: { ...this.profileState.behavioral, ...data }
        };
        this.stateSubject.next(this.profileState);
    }

    updateGoals(data: Partial<GoalsData>): void {
        this.profileState = {
            ...this.profileState,
            goals: { ...this.profileState.goals, ...data }
        };
        this.stateSubject.next(this.profileState);
    }

    updatePreferences(data: Partial<PreferencesData>): void {
        const currentPreferences = this.profileState.preferences ?? {
            preferredInvestmentStyle: 'PASSIVE',
            taxSavingNeeded: false
        };
        this.profileState = {
            ...this.profileState,
            preferences: { ...currentPreferences, ...data }
        };
        this.stateSubject.next(this.profileState);
    }

    // Generic section updater (kept for backward compatibility)
    updateSection<K extends keyof RiskProfileRequest>(
        section: K,
        data: Partial<RiskProfileRequest[K]>
    ): void {
        this.profileState = {
            ...this.profileState,
            [section]: { ...this.profileState[section], ...data }
        };
        this.stateSubject.next(this.profileState);
    }

    submitProfile(): Observable<RiskProfileResponse> {
        return this.http.post<RiskProfileResponse>(this.apiUrl, this.profileState);
    }

    getCurrentState(): RiskProfileRequest {
        return this.profileState;
    }

    resetState(): void {
        this.profileState = {
            demographics: { age: 0, incomeRange: '', dependents: 0 },
            financials: { emergencyFundMonths: 0, existingEmiForLoans: 0, financialKnowledge: '', monthlyInvestmentAmount: 0 },
            behavioral: { marketDropReaction: '', investmentPeriodExperience: '' },
            goals: { primaryGoal: '', timeHorizonYears: 0, targetAmount: 0 },
            preferences: { preferredInvestmentStyle: 'PASSIVE', taxSavingNeeded: false }
        };
        this.stateSubject.next(this.profileState);
    }
}
