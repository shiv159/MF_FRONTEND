import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoughnutChartComponent } from '../../../../shared/charts/doughnut-chart.component';

@Component({
  selector: 'app-sector-chart',
  standalone: true,
  imports: [CommonModule, DoughnutChartComponent],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h4 class="text-lg font-bold text-gray-800 mb-4">Sector Allocation</h4>
      <app-doughnut-chart 
        [data]="chartData" 
        [labels]="chartLabels" 
        [colors]="['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']"
        [centerText]="'Sectors'">
      </app-doughnut-chart>
    </div>
  `
})
export class SectorChartComponent {
  @Input() sectors: Record<string, number> = {};

  get chartData() {
    return Object.values(this.sectors);
  }

  get chartLabels() {
    return Object.keys(this.sectors);
  }
}
