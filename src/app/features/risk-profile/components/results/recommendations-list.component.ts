import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendedAllocation } from '../../../../core/models/api.interface';
import { FundComparisonComponent } from '../../../../shared/components/insights/fund-comparison.component';
import { NavHistoryChartComponent } from '../../../../shared/components/insights/nav-history-chart.component';

@Component({
  selector: 'app-recommendations-list',
  imports: [CommonModule, FundComparisonComponent, NavHistoryChartComponent],
  templateUrl: './recommendations-list.component.html',
  styleUrl: './recommendations-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsListComponent {
  readonly recommendations = input<RecommendedAllocation[]>([]);
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
