import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
    RiskProfileRequest,
    RiskProfileResponse,
    RiskLevel,
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
        return this.http.post<unknown>(this.apiUrl, this.profileState).pipe(
            map(raw => this.normalizeResponse(raw))
        );
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

    private normalizeResponse(raw: unknown): RiskProfileResponse {
        const payload = this.unwrapPayload(raw);

        if (this.isRiskProfileResponse(payload)) {
            return payload;
        }

        const riskProfile = this.pickObject(payload, ['riskProfile', 'risk_profile']);
        const assetAllocation = this.pickObject(payload, ['assetAllocation', 'asset_allocation']);
        const recommendations = this.pickArray(payload, ['recommendations', 'recommendedFunds', 'recommended_funds']);
        const portfolioHealth = this.pickObject(payload, ['portfolioHealth', 'portfolio_health']);

        if (riskProfile || assetAllocation || recommendations.length || portfolioHealth) {
            return {
                riskProfile: {
                    score: this.toNumber(riskProfile?.['score']),
                    level: this.toRiskLevel(riskProfile?.['level']),
                    rationale: this.toText(riskProfile?.['rationale'])
                },
                assetAllocation: {
                    equity: this.toNumber(assetAllocation?.['equity']),
                    debt: this.toNumber(assetAllocation?.['debt']),
                    gold: this.toNumber(assetAllocation?.['gold'])
                },
                recommendations: recommendations as RiskProfileResponse['recommendations'],
                portfolioHealth: portfolioHealth
                    ? (portfolioHealth as unknown as RiskProfileResponse['portfolioHealth'])
                    : undefined
            };
        }

        throw new Error('Unexpected risk profile response structure');
    }

    private unwrapPayload(raw: unknown): Record<string, unknown> {
        let current = this.toObject(raw);
        const wrapperKeys = ['data', 'payload', 'result', 'response'];

        for (let i = 0; i < 5; i++) {
            if (this.hasCoreRiskFields(current)) {
                return current;
            }

            let next: Record<string, unknown> | null = null;
            for (const key of wrapperKeys) {
                const nested = this.toObject(current[key]);
                if (Object.keys(nested).length) {
                    next = nested;
                    break;
                }
            }

            if (!next) {
                break;
            }
            current = next;
        }

        return current;
    }

    private hasCoreRiskFields(value: Record<string, unknown>): boolean {
        return !!(
            value['riskProfile'] ||
            value['risk_profile'] ||
            value['assetAllocation'] ||
            value['asset_allocation'] ||
            value['recommendations'] ||
            value['recommendedFunds'] ||
            value['recommended_funds']
        );
    }

    private pickObject(
        source: Record<string, unknown>,
        keys: string[]
    ): Record<string, unknown> | null {
        for (const key of keys) {
            const obj = this.toObject(source[key]);
            if (Object.keys(obj).length) {
                return obj;
            }
        }
        return null;
    }

    private pickArray(source: Record<string, unknown>, keys: string[]): unknown[] {
        for (const key of keys) {
            const value = source[key];
            if (Array.isArray(value)) {
                return value;
            }
        }
        return [];
    }

    private isRiskProfileResponse(value: unknown): value is RiskProfileResponse {
        const obj = this.toObject(value);
        return !!obj['riskProfile'] && !!obj['assetAllocation'] && Array.isArray(obj['recommendations']);
    }

    private toObject(value: unknown): Record<string, unknown> {
        if (typeof value === 'string') {
            try {
                return this.toObject(JSON.parse(value));
            } catch {
                return {};
            }
        }

        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }

        return {};
    }

    private toNumber(value: unknown): number {
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
    }

    private toText(value: unknown): string {
        return typeof value === 'string' ? value : '';
    }

    private toRiskLevel(value: unknown): RiskLevel {
        const normalized = typeof value === 'string' ? value.toUpperCase() : '';
        if (normalized === 'CONSERVATIVE' || normalized === 'AGGRESSIVE' || normalized === 'MODERATE') {
            return normalized;
        }
        return 'MODERATE';
    }
}
