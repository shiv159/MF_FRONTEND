import { Component, ChangeDetectionStrategy, input, computed, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
    selector: 'app-nav-history-chart',
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './nav-history-chart.component.html',
    styleUrl: './nav-history-chart.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavHistoryChartComponent {
    readonly history = input<Record<string, number> | undefined>(undefined);

    private readonly chart = viewChild(BaseChartDirective);
    readonly chartType = 'line' as const;

    protected readonly chartData = computed<ChartData<'line'>>(() => {
        const hist = this.history();
        if (!hist) return { datasets: [], labels: [] };

        const sortedDates = Object.keys(hist).sort();
        const values = sortedDates.map(d => hist[d]);

        return {
            labels: sortedDates,
            datasets: [
                {
                    data: values,
                    label: 'NAV',
                    borderColor: '#3b82f6',
                    backgroundColor: (ctx) => {
                        const chart = ctx.chart;
                        const { ctx: canvasCtx, chartArea } = chart;
                        if (!chartArea) return 'rgba(59, 130, 246, 0.1)';
                        const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, 'rgba(59, 130, 246, 0)');
                        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.2)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHitRadius: 10,
                    borderWidth: 2
                }
            ]
        };
    });

    protected readonly chartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    label: (ctx) => `NAV: ₹${Number(ctx.parsed.y).toFixed(2)}`
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: { display: false },
                ticks: {
                    maxTicksLimit: 6,
                    color: '#6b7280',
                    font: { size: 10 }
                }
            },
            y: {
                display: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: {
                    color: '#6b7280',
                    font: { size: 10 },
                    callback: (val) => '₹' + val
                }
            }
        }
    };

    protected readonly growthMetrics = computed(() => {
        const hist = this.history();
        if (!hist) return null;

        const dates = Object.keys(hist).sort();
        if (dates.length < 2) return null;

        const startVal = hist[dates[0]];
        const endVal = hist[dates[dates.length - 1]];
        const totalGrowth = ((endVal - startVal) / startVal) * 100;

        // Approximate CAGR
        const years = dates.length / 12;
        const cagr = ((Math.pow(endVal / startVal, 1 / years) - 1) * 100);

        return {
            startVal,
            endVal,
            totalGrowth,
            cagr,
            period: `${dates[0].split('-')[0]} - ${dates[dates.length - 1].split('-')[0]}`
        };
    });

    constructor() {
        effect(() => {
            this.chartData();
            const chartRef = this.chart();
            if (chartRef) {
                chartRef.update();
            }
        });
    }
}
