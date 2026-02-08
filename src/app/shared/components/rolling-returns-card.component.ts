import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RollingReturns } from '../../core/models/api.interface';

@Component({
    selector: 'app-rolling-returns-card',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="returns-card">
            <h4>📈 Performance Returns</h4>
            <div class="returns-grid">
                @for (period of periods; track period.label) {
                    <div class="return-item" 
                         [class.positive]="period.value !== null && period.value > 0" 
                         [class.negative]="period.value !== null && period.value < 0">
                        <span class="label">{{ period.label }}</span>
                        <span class="value">
                            @if (period.value !== null) {
                                {{ period.value | number:'1.1-1' }}%
                            } @else {
                                --
                            }
                        </span>
                    </div>
                }
            </div>
            
            @if (returns().sipReturn3Y || returns().lumpSumReturn3Y) {
                <div class="comparison-section">
                    <h5>SIP vs Lumpsum (3Y)</h5>
                    <div class="comparison-bars">
                        <div class="bar-container">
                            <span class="bar-label">SIP</span>
                            <div class="bar sip-bar" [style.width.%]="sipBarWidth">
                                {{ returns().sipReturn3Y | number:'1.1-1' }}%
                            </div>
                        </div>
                        <div class="bar-container">
                            <span class="bar-label">Lumpsum</span>
                            <div class="bar lumpsum-bar" [style.width.%]="lumpSumBarWidth">
                                {{ returns().lumpSumReturn3Y | number:'1.1-1' }}%
                            </div>
                        </div>
                    </div>
                </div>
            }
            
            @if (returns().cagr) {
                <div class="cagr-section">
                    <span class="cagr-label">CAGR:</span>
                    <span class="cagr-value" [class.positive]="returns().cagr! > 0">
                        {{ returns().cagr | number:'1.2-2' }}%
                    </span>
                </div>
            }
        </div>
    `,
    styles: [`
        .returns-card {
            background: var(--surface-card, #1e293b);
            border-radius: 12px;
            padding: 1rem;
            margin: 0.5rem 0;
        }
        h4 {
            margin: 0 0 0.75rem 0;
            font-size: 0.9rem;
            color: var(--text-primary, #f1f5f9);
        }
        .returns-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
        }
        .return-item {
            text-align: center;
            padding: 0.5rem;
            border-radius: 8px;
            background: var(--surface-ground, #0f172a);
        }
        .return-item.positive .value { color: #22c55e; }
        .return-item.negative .value { color: #ef4444; }
        .label { 
            font-size: 0.7rem; 
            color: var(--text-secondary, #94a3b8);
            display: block;
            margin-bottom: 2px;
        }
        .value { 
            font-size: 1rem; 
            font-weight: 600; 
            display: block;
            color: var(--text-primary, #f1f5f9);
        }
        .comparison-section {
            margin-top: 1rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border-color, #334155);
        }
        h5 {
            margin: 0 0 0.5rem 0;
            font-size: 0.8rem;
            color: var(--text-secondary, #94a3b8);
        }
        .comparison-bars {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        .bar-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .bar-label {
            width: 60px;
            font-size: 0.75rem;
            color: var(--text-secondary, #94a3b8);
        }
        .bar {
            height: 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            padding: 0 8px;
            font-size: 0.75rem;
            font-weight: 500;
            min-width: 60px;
        }
        .sip-bar {
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
            color: white;
        }
        .lumpsum-bar {
            background: linear-gradient(90deg, #8b5cf6, #a78bfa);
            color: white;
        }
        .cagr-section {
            margin-top: 0.75rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border-color, #334155);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .cagr-label {
            font-size: 0.8rem;
            color: var(--text-secondary, #94a3b8);
        }
        .cagr-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-primary, #f1f5f9);
        }
        .cagr-value.positive { color: #22c55e; }
    `]
})
export class RollingReturnsCardComponent {
    readonly returns = input.required<RollingReturns>();

    get periods() {
        const r = this.returns();
        return [
            { label: '1M', value: r.return1M },
            { label: '3M', value: r.return3M },
            { label: '6M', value: r.return6M },
            { label: '1Y', value: r.return1Y },
            { label: '3Y', value: r.return3Y },
            { label: '5Y', value: r.return5Y },
        ];
    }

    get sipBarWidth(): number {
        const sip = Math.abs(this.returns().sipReturn3Y ?? 0);
        const lump = Math.abs(this.returns().lumpSumReturn3Y ?? 0);
        const max = Math.max(sip, lump, 1);
        return (sip / max) * 100;
    }

    get lumpSumBarWidth(): number {
        const sip = Math.abs(this.returns().sipReturn3Y ?? 0);
        const lump = Math.abs(this.returns().lumpSumReturn3Y ?? 0);
        const max = Math.max(sip, lump, 1);
        return (lump / max) * 100;
    }
}
