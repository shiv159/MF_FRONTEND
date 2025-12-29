import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-doughnut-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    template: `
    <div class="relative w-full h-64 md:h-72 flex items-center justify-center">
      <canvas baseChart
        [data]="doughnutChartData"
        [options]="doughnutChartOptions"
        [type]="doughnutChartType">
      </canvas>
      <!-- Center Text (Optional) -->
      <div *ngIf="centerText" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="text-xl font-bold text-gray-700">{{ centerText }}</span>
      </div>
    </div>
  `
})
export class DoughnutChartComponent implements OnChanges {
    @Input() labels: string[] = [];
    @Input() data: number[] = [];
    @Input() centerText: string = '';
    @Input() colors: string[] = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']; // Blue, Green, Amber, Red

    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

    public doughnutChartType: 'doughnut' = 'doughnut';

    public doughnutChartData: ChartData<'doughnut'> = {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
    };

    public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { font: { size: 12 }, usePointStyle: true }
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
        cutout: '70%', // Thinner ring
        layout: { padding: 20 }
    };

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] || changes['labels']) {
            this.updateChart();
        }
    }

    private updateChart() {
        this.doughnutChartData = {
            labels: this.labels,
            datasets: [
                {
                    data: this.data,
                    backgroundColor: this.colors,
                    hoverOffset: 4,
                    borderWidth: 0
                }
            ]
        };
        this.chart?.update();
    }
}
