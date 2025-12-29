import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoughnutChartComponent } from '../../../../shared/charts/doughnut-chart.component';

@Component({
  selector: 'app-asset-allocation-chart',
  standalone: true,
  imports: [CommonModule, DoughnutChartComponent],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h4 class="text-lg font-bold text-gray-800 mb-4">Recommended Asset Allocation</h4>
      <app-doughnut-chart 
        [data]="chartData" 
        [labels]="chartLabels" 
        [colors]="['#3b82f6', '#10b981', '#fbbf24']"
        [centerText]="centerText">
      </app-doughnut-chart>
      <div class="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div *ngFor="let label of chartLabels; let i = index">
          <div class="font-bold text-gray-800">{{ chartData[i] }}%</div>
          <div class="text-gray-500">{{ label }}</div>
        </div>
      </div>
    </div>
  `
})
export class AssetAllocationChartComponent {
  @Input() allocation: { equity: number, debt: number, gold: number } = { equity: 0, debt: 0, gold: 0 };

  get chartData() {
    return [this.allocation.equity, this.allocation.debt, this.allocation.gold];
  }

  get chartLabels() {
    return ['Equity', 'Debt', 'Gold'];
  }

  get centerText() {
    return `${this.allocation.equity}% Eq`;
  }
}
