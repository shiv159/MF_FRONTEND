import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopHolding } from '../../../core/models/api.interface';

interface ValuationGroup {
    category: 'Undervalued' | 'Fairly Valued' | 'Overvalued';
    color: string;
    bgColor: string;
    icon: string;
    stocks: TopHolding[];
}

@Component({
    selector: 'app-stock-valuation-cards',
    imports: [CommonModule],
    templateUrl: './stock-valuation-cards.component.html',
    styleUrl: './stock-valuation-cards.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockValuationCardsComponent {
    readonly holdings = input<TopHolding[]>([]);

    protected readonly valuationGroups = computed<ValuationGroup[]>(() => {
        const stocks = this.holdings();
        if (!stocks || stocks.length === 0) return [];

        const undervalued = stocks.filter(s => s.assessment === 'Undervalued');
        const fairlyValued = stocks.filter(s => s.assessment === 'Fairly Valued');
        const overvalued = stocks.filter(s => s.assessment === 'Overvalued');

        const groups: ValuationGroup[] = [];

        if (undervalued.length > 0) {
            groups.push({
                category: 'Undervalued',
                color: '#059669',
                bgColor: 'rgba(5, 150, 105, 0.1)',
                icon: '🟢',
                stocks: undervalued
            });
        }

        if (fairlyValued.length > 0) {
            groups.push({
                category: 'Fairly Valued',
                color: '#d97706',
                bgColor: 'rgba(217, 119, 6, 0.1)',
                icon: '🟡',
                stocks: fairlyValued
            });
        }

        if (overvalued.length > 0) {
            groups.push({
                category: 'Overvalued',
                color: '#dc2626',
                bgColor: 'rgba(220, 38, 38, 0.1)',
                icon: '🔴',
                stocks: overvalued
            });
        }

        return groups;
    });

    protected readonly hasData = computed(() =>
        this.holdings().some(h => h.assessment)
    );

    protected getStarRating(rating: string | undefined): string {
        if (!rating) return '';
        const stars = parseInt(rating, 10);
        if (isNaN(stars)) return '';
        return '★'.repeat(stars) + '☆'.repeat(5 - stars);
    }

    protected formatReturn(value: number | undefined): string {
        if (value === undefined || value === null) return '-';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(1)}%`;
    }

    protected getReturnClass(value: number | undefined): string {
        if (value === undefined || value === null) return '';
        return value >= 0 ? 'positive' : 'negative';
    }
}
