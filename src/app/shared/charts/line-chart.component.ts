import { Component, ChangeDetectionStrategy, input, effect, viewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { YearProjection } from '../../core/models/api.interface';

@Component({
    selector: 'app-line-chart',
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './line-chart.component.html',
    styleUrl: './line-chart.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent {
    readonly projectionData = input<YearProjection[]>([]);
    readonly showLegend = input<boolean>(true);

    private readonly chart = viewChild(BaseChartDirective);

    readonly lineChartType = 'line' as const;

    protected readonly lineChartData = computed<ChartData<'line'>>(() => {
        const data = this.projectionData();
        if (!data || data.length === 0) {
            return { datasets: [], labels: [] };
        }

        const labels = data.map(d => `Year ${d.year}`);
        const optimistic = data.map(d => d.optimisticAmount);
        const expected = data.map(d => d.expectedAmount);
        const pessimistic = data.map(d => d.pessimisticAmount);

        return {
            labels: labels,
            datasets: [
                {
                    data: optimistic,
                    label: 'Optimistic',
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: '+1',
                    borderWidth: 2
                },
                {
                    data: expected,
                    label: 'Expected',
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: '+1',
                    borderWidth: 3
                },
                {
                    data: pessimistic,
                    label: 'Pessimistic',
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    fill: 'origin',
                    borderWidth: 2
                }
            ]
        };
    });

    protected readonly lineChartOptions = computed<ChartConfiguration<'line'>['options']>(() => ({
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: { tension: 0.4 },
            point: { radius: 0, hitRadius: 10, hoverRadius: 5 }
        },
        scales: {
            x: {
                grid: { display: false },
                title: { display: true, text: 'Years', color: '#6b7280' },
                ticks: { color: '#6b7280' }
            },
            y: {
                grid: { color: 'rgba(156, 163, 175, 0.2)' },
                ticks: {
                    color: '#6b7280',
                    callback: (value) => {
                        if (typeof value === 'number') {
                            return '₹' + this.formatCompact(value);
                        }
                        return value;
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: this.showLegend(),
                position: 'top',
                labels: { color: '#6b7280' }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        }
    }));

    constructor() {
        effect(() => {
            // Track signals
            this.projectionData();
            this.showLegend();

            // Update chart
            const chartRef = this.chart();
            if (chartRef) {
                chartRef.update();
            }
        });
    }

    private formatCompact(num: number): string {
        return Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(num);
    }
}
