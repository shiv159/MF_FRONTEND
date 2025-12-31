import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FundMetadata } from '../../../core/models/api.interface';

@Component({
    selector: 'app-fund-comparison',
    imports: [CommonModule],
    templateUrl: './fund-comparison.component.html',
    styleUrl: './fund-comparison.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundComparisonComponent {
    readonly metadata = input<FundMetadata | undefined>(undefined);

    protected readonly comparisonData = computed(() => {
        const meta = this.metadata();
        if (!meta?.risk_volatility) return null;

        const risk = meta.risk_volatility;
        // Prefer 3 year data, fallback to 1 year
        const period = risk.fund_risk_volatility.for3Year.alpha !== null ? '3 Year' : '1 Year';

        const fundRisk = period === '3 Year' ? risk.fund_risk_volatility.for3Year : risk.fund_risk_volatility.for1Year;
        const catRisk = period === '3 Year' ? risk.category_risk_volatility.for3Year : risk.category_risk_volatility.for1Year;
        const idxRisk = period === '3 Year' ? risk.index_risk_volatility.for3Year : risk.index_risk_volatility.for1Year;

        return {
            period,
            fundName: meta.name,
            categoryName: risk.category_name,
            indexName: risk.index_name,
            alpha: {
                fund: fundRisk.alpha ?? 0,
                category: catRisk.alpha ?? 0,
                index: idxRisk.alpha ?? 0
            },
            sharpe: {
                fund: fundRisk.sharpeRatio ?? 0,
                category: catRisk.sharpeRatio ?? 0,
                index: idxRisk.sharpeRatio ?? 0
            }
        };
    });

    protected getProgressWidth(value: number, max: number): number {
        const percentage = (Math.abs(value) / max) * 100;
        return Math.min(percentage, 100);
    }

    protected readonly maxAlpha = computed(() => {
        const data = this.comparisonData();
        if (!data) return 10;
        return Math.max(
            Math.abs(data.alpha.fund),
            Math.abs(data.alpha.category),
            Math.abs(data.alpha.index)
        ) * 1.1; // Add 10% buffer
    });

    protected readonly maxSharpe = computed(() => {
        const data = this.comparisonData();
        if (!data) return 2;
        return Math.max(
            Math.abs(data.sharpe.fund),
            Math.abs(data.sharpe.category),
            Math.abs(data.sharpe.index)
        ) * 1.1;
    });
}
