import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskInsights } from '../../core/models/api.interface';

@Component({
    selector: 'app-risk-insights-badge',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="risk-badge" [class]="badgeClass" [title]="tooltipText">
            <span class="icon">{{ icon }}</span>
            <span class="label">{{ displayLabel }}</span>
        </div>
    `,
    styles: [`
        .risk-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 16px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: help;
            transition: transform 0.2s;
        }
        .risk-badge:hover {
            transform: scale(1.05);
        }
        .risk-badge.low {
            background: rgba(34, 197, 94, 0.15);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .risk-badge.market_aligned {
            background: rgba(59, 130, 246, 0.15);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .risk-badge.high {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .icon { font-size: 0.9rem; }
        .label { font-weight: 600; }
    `]
})
export class RiskInsightsBadgeComponent {
    readonly insights = input.required<RiskInsights>();

    get icon(): string {
        switch (this.insights().volatilityLevel) {
            case 'LOW': return '🛡️';
            case 'MARKET_ALIGNED': return '📊';
            case 'HIGH': return '⚡';
            default: return '📊';
        }
    }

    get displayLabel(): string {
        switch (this.insights().volatilityLevel) {
            case 'LOW': return 'Defensive';
            case 'MARKET_ALIGNED': return 'Balanced';
            case 'HIGH': return 'Aggressive';
            default: return 'Balanced';
        }
    }

    get badgeClass(): string {
        return this.insights().volatilityLevel.toLowerCase();
    }

    get tooltipText(): string {
        const i = this.insights();
        const lines = [i.alphaInsight, i.betaInsight];
        if (i.alpha !== null) {
            lines.push(`Alpha: ${i.alpha.toFixed(2)}%`);
        }
        if (i.beta !== null) {
            lines.push(`Beta: ${i.beta.toFixed(2)}`);
        }
        return lines.join('\n');
    }
}
