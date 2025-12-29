import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';
import { RiskProfileRequest } from '../../../core/models/api.interface';

@Injectable({
    providedIn: 'root'
})
export class RiskProfileService {
    private apiUrl = '/api/onboarding/risk-profile';

    // State Management for the Wizard
    private profileState: RiskProfileRequest = {
        demographics: { age: 0, incomeRange: '', dependents: 0 },
        financials: { emergencyFundMonths: 0, existingEmiForLoans: 0, financialKnowledge: '', monthlyInvestmentAmount: 0 },
        behavioral: { marketDropReaction: '', investmentPeriodExperience: '' },
        goals: { primaryGoal: '', timeHorizonYears: 0, targetAmount: 0 },
        preferences: { preferredInvestmentStyle: 'PASSIVE', taxSavingNeeded: false }
    };

    private stateSubject = new BehaviorSubject<RiskProfileRequest>(this.profileState);
    state$ = this.stateSubject.asObservable();

    constructor(private http: HttpClient) { }

    updateState(partial: Partial<RiskProfileRequest>) {
        this.profileState = { ...this.profileState, ...partial };
        this.stateSubject.next(this.profileState);
    }

    // Helper to update nested objects
    updateSection<K extends keyof RiskProfileRequest>(section: K, data: Partial<RiskProfileRequest[K]>) {
        this.profileState = {
            ...this.profileState,
            [section]: { ...this.profileState[section], ...data }
        };
        this.stateSubject.next(this.profileState);
    }

    submitProfile(): Observable<any> {
        // For now, mock the response if backend isn't ready, or allow real call
        // return this.http.post(this.apiUrl, this.profileState);

        // Mock Response for Development
        const mockResponse = {
            riskProfile: { score: 72, level: 'AGGRESSIVE', rationale: 'High time horizon and risk tolerance.' },
            assetAllocation: { equity: 70, debt: 20, gold: 10 },
            recommendations: [
                { fundName: 'HDFC Top 100 Fund', category: 'Large Cap', sharpe: 1.2, allocation: 40 },
                { fundName: 'Axis Midcap Fund', category: 'Mid Cap', sharpe: 1.1, allocation: 30 }
            ],
            wealthProjection: {
                timeline: [
                    { year: 1, optimisticAmount: 120000, expectedAmount: 110000, pessimisticAmount: 100000 },
                    { year: 5, optimisticAmount: 800000, expectedAmount: 650000, pessimisticAmount: 500000 },
                    { year: 10, optimisticAmount: 2500000, expectedAmount: 1800000, pessimisticAmount: 1200000 }
                ]
            }
        };
        return of(mockResponse).pipe(delay(1500));
    }

    getCurrentState(): RiskProfileRequest {
        return this.profileState;
    }
}
