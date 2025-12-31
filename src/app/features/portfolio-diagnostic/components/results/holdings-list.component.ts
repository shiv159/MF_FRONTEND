import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManualSelectionHolding } from '../../../../core/models/api.interface';
import { FundComparisonComponent } from '../../../../shared/components/insights/fund-comparison.component';
import { NavHistoryChartComponent } from '../../../../shared/components/insights/nav-history-chart.component';

@Component({
  selector: 'app-holdings-list',
  imports: [CommonModule, FundComparisonComponent, NavHistoryChartComponent],
  templateUrl: './holdings-list.component.html',
  styleUrl: './holdings-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingsListComponent {
  readonly holdings = input<ManualSelectionHolding[]>([]);
  readonly expandedIds = signal<Set<string>>(new Set());

  toggleExpand(fundId: string): void {
    const current = new Set(this.expandedIds());
    if (current.has(fundId)) {
      current.delete(fundId);
    } else {
      current.add(fundId);
    }
    this.expandedIds.set(current);
  }

  isExpanded(fundId: string): boolean {
    return this.expandedIds().has(fundId);
  }
}
