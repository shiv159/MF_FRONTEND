import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import {
    RollingReturns,
    RiskInsights,
    PortfolioCovariance,
    CovarianceRequest
} from '../../core/models/api.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FundAnalyticsService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/api/v1`;

    // Cache for rolling returns (avoid repeated calls)
    private readonly returnsCache = new Map<string, Observable<RollingReturns>>();
    private readonly insightsCache = new Map<string, Observable<RiskInsights>>();

    /**
     * GET /api/v1/funds/{fundId}/rolling-returns
     * 
     * Fetches rolling returns (1M, 3M, 6M, 1Y, 3Y, 5Y) calculated from NAV history.
     * Results are cached to avoid redundant API calls.
     * 
     * @param fundId - UUID of the fund
     * @returns Observable<RollingReturns>
     */
    getRollingReturns(fundId: string): Observable<RollingReturns> {
        if (!this.returnsCache.has(fundId)) {
            const request$ = this.http.get<RollingReturns>(
                `${this.baseUrl}/funds/${fundId}/rolling-returns`
            ).pipe(shareReplay(1));
            this.returnsCache.set(fundId, request$);
        }
        return this.returnsCache.get(fundId)!;
    }

    /**
     * GET /api/v1/funds/{fundId}/risk-insights
     * 
     * Fetches plain-language risk insights based on alpha, beta, and volatility.
     * Results are cached to avoid redundant API calls.
     * 
     * @param fundId - UUID of the fund
     * @returns Observable<RiskInsights>
     */
    getRiskInsights(fundId: string): Observable<RiskInsights> {
        if (!this.insightsCache.has(fundId)) {
            const request$ = this.http.get<RiskInsights>(
                `${this.baseUrl}/funds/${fundId}/risk-insights`
            ).pipe(shareReplay(1));
            this.insightsCache.set(fundId, request$);
        }
        return this.insightsCache.get(fundId)!;
    }

    /**
     * POST /api/v1/portfolio/covariance
     * 
     * Calculates portfolio covariance matrix and diversification metrics.
     * This is NOT cached as portfolio composition may change.
     * 
     * @param request - List of fund IDs with their weights
     * @returns Observable<PortfolioCovariance>
     */
    getPortfolioCovariance(request: CovarianceRequest): Observable<PortfolioCovariance> {
        return this.http.post<PortfolioCovariance>(
            `${this.baseUrl}/portfolio/covariance`,
            request
        );
    }

    /**
     * Helper to build covariance request from holdings array
     */
    buildCovarianceRequest(holdings: Array<{ fundId: string; weightPct: number }>): CovarianceRequest {
        return {
            funds: holdings.map(h => ({
                fundId: h.fundId,
                weight: h.weightPct / 100  // Convert percentage to decimal
            }))
        };
    }

    /**
     * Clear all cached data (call when user logs out or portfolio changes)
     */
    clearCache(): void {
        this.returnsCache.clear();
        this.insightsCache.clear();
    }
}
