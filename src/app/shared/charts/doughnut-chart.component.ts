import { Component, ChangeDetectionStrategy, input, effect, viewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
    selector: 'app-doughnut-chart',
    imports: [CommonModule, BaseChartDirective],
    templateUrl: './doughnut-chart.component.html',
    styleUrl: './doughnut-chart.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoughnutChartComponent {
    readonly labels = input<string[]>([]);
    readonly data = input<number[]>([]);
    readonly centerText = input<string>('');
    readonly showLegend = input<boolean>(true);
    readonly colors = input<string[]>(['#3b82f6', '#10b981', '#f59e0b', '#ef4444']);

    private readonly chart = viewChild(BaseChartDirective);

    readonly doughnutChartType = 'doughnut' as const;

    protected readonly doughnutChartData = computed<ChartData<'doughnut'>>(() => ({
        labels: this.labels(),
        datasets: [{
            data: this.data(),
            backgroundColor: this.colors(),
            hoverOffset: 4,
            borderWidth: 0
        }]
    }));

    protected readonly doughnutChartOptions = computed<ChartConfiguration<'doughnut'>['options']>(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: this.showLegend(),
                position: 'bottom',
                labels: {
                    font: { size: 12 },
                    usePointStyle: true,
                    color: '#6b7280'
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed;
                        return ` ${label}: ${value}%`;
                    }
                }
            }
        },
        cutout: '70%',
        layout: { padding: 20 }
    }));

    constructor() {
        // Effect to update chart when data changes
        effect(() => {
            // Access signals to track them
            this.data();
            this.labels();
            this.colors();
            this.showLegend();

            // Update chart
            const chartRef = this.chart();
            if (chartRef) {
                chartRef.update();
            }
        });
    }
}
