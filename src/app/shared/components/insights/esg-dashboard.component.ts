import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopHolding } from '../../../core/models/api.interface';

interface EsgCategory {
    label: string;
    count: number;
    weight: number;
    color: string;
    stocks: string[];
}

@Component({
    selector: 'app-esg-dashboard',
    imports: [CommonModule],
    templateUrl: './esg-dashboard.component.html',
    styleUrl: './esg-dashboard.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EsgDashboardComponent {
    readonly holdings = input<TopHolding[]>([]);

    protected readonly avgEsgScore = computed(() => {
        const list = this.holdings().filter(h => h.susEsgRiskScore !== null && h.susEsgRiskScore !== undefined);
        if (list.length === 0) return 0;

        // Weighted average
        const totalWt = list.reduce((acc, curr) => acc + curr.weighting, 0);
        if (totalWt === 0) return 0;

        const weightedScore = list.reduce((acc, curr) => acc + (curr.susEsgRiskScore! * curr.weighting), 0);
        return weightedScore / totalWt;
    });

    protected readonly esgCategories = computed<EsgCategory[]>(() => {
        const list = this.holdings();
        if (!list.length) return [];

        const categories: Record<string, EsgCategory> = {
            'Low': { label: 'Low Risk', count: 0, weight: 0, color: '#10b981', stocks: [] },
            'Medium': { label: 'Medium Risk', count: 0, weight: 0, color: '#f59e0b', stocks: [] },
            'High': { label: 'High Risk', count: 0, weight: 0, color: '#f97316', stocks: [] },
            'Severe': { label: 'Severe Risk', count: 0, weight: 0, color: '#ef4444', stocks: [] },
        };

        list.forEach(h => {
            if (h.susEsgRiskCategory && categories[h.susEsgRiskCategory]) {
                const cat = categories[h.susEsgRiskCategory];
                cat.count++;
                cat.weight += h.weighting;
                if (cat.stocks.length < 3) cat.stocks.push(h.securityName);
            }
        });

        return Object.values(categories).filter(c => c.count > 0);
    });

    protected readonly hasData = computed(() =>
        this.holdings().some(h => h.susEsgRiskScore !== null || h.susEsgRiskCategory !== null)
    );

    protected getRiskLabel(score: number): string {
        if (score < 20) return 'Low Risk';
        if (score < 30) return 'Medium Risk';
        if (score < 40) return 'High Risk';
        return 'Severe Risk';
    }

    protected getRiskColor(score: number): string {
        if (score < 20) return '#10b981';
        if (score < 30) return '#f59e0b';
        if (score < 40) return '#f97316';
        return '#ef4444';
    }
}
