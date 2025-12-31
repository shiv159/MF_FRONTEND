import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoughnutChartComponent } from '../../../../shared/charts/doughnut-chart.component';
import { AssetAllocation } from '../../../../core/models/api.interface';

@Component({
  selector: 'app-asset-allocation-chart',
  imports: [CommonModule, DoughnutChartComponent],
  templateUrl: './asset-allocation-chart.component.html',
  styleUrl: './asset-allocation-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetAllocationChartComponent {
  readonly allocation = input<AssetAllocation>({ equity: 0, debt: 0, gold: 0 });

  protected readonly chartData = computed(() => {
    const alloc = this.allocation();
    return [alloc.equity, alloc.debt, alloc.gold];
  });

  protected readonly chartLabels = ['Equity', 'Debt', 'Gold'];
  protected readonly chartColors = ['#3b82f6', '#10b981', '#fbbf24'];

  protected readonly centerText = computed(() => `${this.allocation().equity}% Eq`);
}
