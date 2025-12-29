import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartData } from 'chart.js';
import { YearProjection } from '../../core/models/api.interface';

@Component({
    selector: 'app-line-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    template: `
    <div class="relative w-full h-72 md:h-80">
      <canvas baseChart
        [data]="lineChartData"
        [options]="lineChartOptions"
        [type]="lineChartType">
      </canvas>
    </div>
  `
})
export class LineChartComponent implements OnChanges {
    // Input expected: Array of YearProjection from API
    @Input() projectionData: YearProjection[] = [];

    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

    public lineChartType: 'line' = 'line';

    public lineChartData: ChartData<'line'> = {
        datasets: [],
        labels: []
    };

    public lineChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: { tension: 0.4 }, // Smooth curves
            point: { radius: 0, hitRadius: 10, hoverRadius: 5 } // Hide points until hover
        },
        scales: {
            x: {
                grid: { display: false },
                title: { display: true, text: 'Years' }
            },
            y: {
                grid: { color: '#f3f4f6' }, // Light gray grid
                ticks: {
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
            legend: { display: true, position: 'top' },
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
                            label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        }
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['projectionData'] && this.projectionData.length > 0) {
            this.updateChart();
        }
    }

    private updateChart() {
        const labels = this.projectionData.map(d => `Year ${d.year}`);
        const optimistic = this.projectionData.map(d => d.optimisticAmount);
        const expected = this.projectionData.map(d => d.expectedAmount);
        const pessimistic = this.projectionData.map(d => d.pessimisticAmount);

        this.lineChartData = {
            labels: labels,
            datasets: [
                {
                    data: optimistic,
                    label: 'Optimistic',
                    borderColor: '#10b981', // Green
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: '+1', // Fill down to expected
                    borderWidth: 2
                },
                {
                    data: expected,
                    label: 'Expected',
                    borderColor: '#3b82f6', // Blue
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: '+1', // Fill down to pessimistic
                    borderWidth: 3
                },
                {
                    data: pessimistic,
                    label: 'Pessimistic',
                    borderColor: '#ef4444', // Red
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    fill: 'origin', // Fill down to x-axis
                    borderWidth: 2
                }
            ]
        };

        this.chart?.update();
    }

    private formatCompact(num: number): string {
        return Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    }
}
