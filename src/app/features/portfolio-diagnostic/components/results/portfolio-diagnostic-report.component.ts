import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDiagnosticDTO, DiagnosticSuggestion, DiagnosticSeverity } from '../../../../core/models/api.interface';

@Component({
    selector: 'app-portfolio-diagnostic-report',
    imports: [CommonModule],
    templateUrl: './portfolio-diagnostic-report.component.html',
    styleUrl: './portfolio-diagnostic-report.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioDiagnosticReportComponent {
    readonly diagnostic = input<PortfolioDiagnosticDTO | null>(null);
    readonly isLoading = input<boolean>(false);

    protected readonly highSuggestions = computed(() =>
        this.diagnostic()?.suggestions.filter(s => s.severity === 'HIGH') ?? []
    );

    protected readonly mediumSuggestions = computed(() =>
        this.diagnostic()?.suggestions.filter(s => s.severity === 'MEDIUM') ?? []
    );

    protected readonly lowSuggestions = computed(() =>
        this.diagnostic()?.suggestions.filter(s => s.severity === 'LOW') ?? []
    );

    protected readonly hasIssues = computed(() =>
        (this.diagnostic()?.suggestions.length ?? 0) > 0
    );

    protected readonly scoreLabel = computed(() => {
        const score = this.diagnostic()?.metrics.diversificationScore ?? 0;
        if (score >= 7) return 'Excellent';
        if (score >= 5) return 'Good';
        if (score >= 3) return 'Fair';
        return 'Needs Work';
    });

    protected readonly scoreClass = computed(() => {
        const score = this.diagnostic()?.metrics.diversificationScore ?? 0;
        if (score >= 7) return 'score-excellent';
        if (score >= 5) return 'score-good';
        if (score >= 3) return 'score-fair';
        return 'score-poor';
    });

    getSeverityIcon(severity: DiagnosticSeverity): string {
        switch (severity) {
            case 'HIGH': return '🔴';
            case 'MEDIUM': return '🟡';
            case 'LOW': return '🟢';
        }
    }

    getSeverityLabel(severity: DiagnosticSeverity): string {
        switch (severity) {
            case 'HIGH': return 'High Priority';
            case 'MEDIUM': return 'Medium';
            case 'LOW': return 'Low';
        }
    }

    getCategoryLabel(category: string): string {
        const labels: Record<string, string> = {
            'FUND_HOUSE_CONCENTRATION': 'Fund House Concentration',
            'LACK_OF_DIVERSIFICATION': 'Low Diversification',
            'OVER_DIVERSIFICATION': 'Over-Diversification',
            'SECTOR_CONCENTRATION': 'Sector Concentration',
            'STOCK_OVERLAP': 'Stock Overlap',
            'EMOTIONAL_DECISIONS': 'Behavioral Insight',
            'HIGH_EXPENSE_RATIO': 'High Costs',
            'NO_DEBT_ALLOCATION': 'Missing Debt',
            'NO_EQUITY_ALLOCATION': 'Missing Equity',
            'MARKET_CAP_IMBALANCE': 'Market Cap Skew'
        };
        return labels[category] || category;
    }

    /** Get fund house entries sorted by count descending */
    protected readonly sortedFundHouses = computed(() => {
        const dist = this.diagnostic()?.metrics.fundHouseDistribution;
        if (!dist) return [];
        return Object.entries(dist)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({ name, count }));
    });

    /** Get asset class entries sorted by allocation descending */
    protected readonly sortedAssetClasses = computed(() => {
        const breakdown = this.diagnostic()?.metrics.assetClassBreakdown;
        if (!breakdown) return [];
        return Object.entries(breakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([name, pct]) => ({ name, pct }));
    });
}
