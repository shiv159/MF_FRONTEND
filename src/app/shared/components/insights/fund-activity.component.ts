import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopHolding } from '../../../core/models/api.interface';

interface ActivityItem {
    name: string;
    ticker: string;
    shareChange: number;
    changeType: 'BUY' | 'SELL' | 'HOLD';
    amount: string;
}

@Component({
    selector: 'app-fund-activity',
    imports: [CommonModule],
    templateUrl: './fund-activity.component.html',
    styleUrl: './fund-activity.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundActivityComponent {
    readonly holdings = input<TopHolding[]>([]);

    protected readonly activity = computed<ActivityItem[]>(() => {
        const list = this.holdings();
        if (!list.length) return [];

        return list
            .filter(h => h.shareChange !== 0 && h.shareChange !== undefined)
            .map(h => {
                const change = h.shareChange!;
                return {
                    name: h.securityName,
                    ticker: h.ticker,
                    shareChange: change,
                    changeType: (change > 0 ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
                    amount: this.formatNumber(Math.abs(change))
                };
            })
            .sort((a, b) => Math.abs(b.shareChange) - Math.abs(a.shareChange))
            .slice(0, 5); // Top 5 moves
    });

    protected readonly hasActivity = computed(() => this.activity().length > 0);

    private formatNumber(num: number): string {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    }
}
