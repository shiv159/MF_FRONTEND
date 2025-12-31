import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopHolding } from '../../../core/models/api.interface';

interface CountryData {
    name: string;
    weight: number;
    flag: string;
}

@Component({
    selector: 'app-geographic-allocation',
    imports: [CommonModule],
    templateUrl: './geographic-allocation.component.html',
    styleUrl: './geographic-allocation.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeographicAllocationComponent {
    readonly holdings = input<TopHolding[]>([]);

    protected readonly countryData = computed<CountryData[]>(() => {
        const list = this.holdings();
        if (!list.length) return [];

        const map = new Map<string, number>();

        list.forEach(h => {
            const country = h.country || 'Unknown';
            map.set(country, (map.get(country) || 0) + h.weighting);
        });

        const totalWeight = Array.from(map.values()).reduce((a, b) => a + b, 0);

        return Array.from(map.entries())
            .map(([name, weight]) => ({
                name,
                // Normalize to 100% of top holdings or absolute weight? 
                // Let's keep absolute weight relative to these holdings for accuracy
                weight: weight,
                flag: this.getFlagEmoji(name)
            }))
            .sort((a, b) => b.weight - a.weight);
    });

    protected readonly hasData = computed(() => this.countryData().length > 0);

    private getFlagEmoji(country: string): string {
        const flags: Record<string, string> = {
            'India': '🇮🇳',
            'United States': '🇺🇸',
            'China': '🇨🇳',
            'Japan': '🇯🇵',
            'Germany': '🇩🇪',
            'United Kingdom': '🇬🇧',
            'France': '🇫🇷',
            'Canada': '🇨🇦',
            'Brazil': '🇧🇷',
            'South Korea': '🇰🇷'
        };
        return flags[country] || '🏳️';
    }
}
