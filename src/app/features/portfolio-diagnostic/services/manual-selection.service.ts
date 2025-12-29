import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { ManualSelectionRequest, ManualSelectionResponse } from '../../../core/models/api.interface';

@Injectable({
    providedIn: 'root'
})
export class ManualSelectionService {
    private apiUrl = '/api/portfolio/manual-selection';

    constructor(private http: HttpClient) { }

    searchFunds(query: string): Observable<any[]> {
        if (!query || query.length < 3) return of([]);
        // Mock Search Response
        const mockFunds = [
            { id: '1', name: 'HDFC Top 100 Fund', isin: 'INF179K01BE2', amc: 'HDFC Mutual Fund' },
            { id: '2', name: 'Axis Bluechip Fund', isin: 'INF846K01234', amc: 'Axis Mutual Fund' },
            { id: '3', name: 'SBI Small Cap Fund', isin: 'INF200K01T28', amc: 'SBI Mutual Fund' },
            { id: '4', name: 'Parag Parikh Flexi Cap Fund', isin: 'INF879O01027', amc: 'PPFAS Mutual Fund' }
        ].filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

        return of(mockFunds).pipe(delay(300));
    }

    submitSelection(request: ManualSelectionRequest): Observable<ManualSelectionResponse> {
        // Mock Response
        const response: ManualSelectionResponse = {
            results: request.selections.map((s, i) => ({
                inputFundId: s.fundId || null,
                inputFundName: s.fundName || null,
                status: 'RESOLVED_FROM_DB',
                fundId: s.fundId || `mock-id-${i}`,
                fundName: s.fundName || 'Unknown Fund',
                isin: 'INF-MOCK',
                message: 'Success'
            })),
            portfolio: {
                summary: { totalHoldings: request.selections.length, totalWeightPct: 100 },
                holdings: request.selections.map((s, i) => ({
                    fundId: s.fundId || `mock-id-${i}`,
                    fundName: s.fundName || 'Unknown Fund',
                    isin: 'INF-MOCK',
                    amcName: 'Mock AMC',
                    fundCategory: 'Equity',
                    directPlan: true,
                    currentNav: 120.5,
                    navAsOf: '2025-12-29',
                    weightPct: s.weightPct,
                    sectorAllocation: { 'Finance': 30, 'Technology': 20, 'Energy': 15, 'Others': 35 },
                    topHoldings: [
                        { symbol: 'HDFCBANK', company: 'HDFC Bank', weight: 9.5 },
                        { symbol: 'RELIANCE', company: 'Reliance Ind', weight: 8.2 }
                    ],
                    fundMetadata: {}
                }))
            },
            analysis: {
                sectorConcentration: 'Balanced',
                overlapStatus: 'Moderate',
                diversificationScore: 8.5,
                topOverlappingStocks: [
                    { stockName: 'HDFC Bank', isin: 'INE040A01034', totalWeight: 12.3, fundCount: 2, fundNames: ['HDFC Fund', 'Axis Fund'] }
                ],
                fundSimilarities: [],
                wealthProjection: {
                    projectedYears: 10,
                    totalInvestment: 100000,
                    likelyScenarioAmount: 250000,
                    pessimisticScenarioAmount: 180000,
                    optimisticScenarioAmount: 350000,
                    timeline: [
                        { year: 1, optimisticAmount: 110000, expectedAmount: 108000, pessimisticAmount: 105000 },
                        { year: 5, optimisticAmount: 180000, expectedAmount: 150000, pessimisticAmount: 130000 },
                        { year: 10, optimisticAmount: 350000, expectedAmount: 250000, pessimisticAmount: 180000 }
                    ]
                },
                aggregateSectorAllocation: {
                    'Finance': 28, 'Technology': 22, 'Consumer': 15, 'Energy': 12, 'Healthcare': 10, 'Others': 13
                }
            }
        };
        return of(response).pipe(delay(1500));
    }
}
