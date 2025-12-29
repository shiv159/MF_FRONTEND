import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineChartComponent } from '../../../../shared/charts/line-chart.component';
import { YearProjection } from '../../../../core/models/api.interface';

@Component({
  selector: 'app-wealth-projection-chart',
  standalone: true,
  imports: [CommonModule, LineChartComponent],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-lg font-bold text-gray-800">Wealth Projection</h4>
        <div class="flex gap-4 text-xs">
          <div class="flex items-center"><span class="w-3 h-3 rounded-full bg-green-500 mr-1"></span> Optimistic</div>
          <div class="flex items-center"><span class="w-3 h-3 rounded-full bg-blue-500 mr-1"></span> Expected</div>
          <div class="flex items-center"><span class="w-3 h-3 rounded-full bg-red-400 mr-1"></span> Pessimistic</div>
        </div>
      </div>
      <app-line-chart [projectionData]="timeline"></app-line-chart>
    </div>
  `
})
export class WealthProjectionChartComponent {
  @Input() timeline: YearProjection[] = [];
}
