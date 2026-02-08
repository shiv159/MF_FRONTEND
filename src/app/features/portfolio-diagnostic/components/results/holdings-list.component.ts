import { Component, ChangeDetectionStrategy, input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManualSelectionHolding, RollingReturns, RiskInsights } from '../../../../core/models/api.interface';
import { FundComparisonComponent } from '../../../../shared/components/insights/fund-comparison.component';
import { NavHistoryChartComponent } from '../../../../shared/components/insights/nav-history-chart.component';
import { FundAnalyticsService } from '../../../../shared/services/fund-analytics.service';
import { RollingReturnsCardComponent } from '../../../../shared/components/rolling-returns-card.component';
import { RiskInsightsBadgeComponent } from '../../../../shared/components/risk-insights-badge.component';

@Component({
  selector: 'app-holdings-list',
  imports: [
    CommonModule,
    FundComparisonComponent,
    NavHistoryChartComponent,
    RollingReturnsCardComponent,
    RiskInsightsBadgeComponent
  ],
  templateUrl: './holdings-list.component.html',
  styleUrl: './holdings-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingsListComponent {
  private readonly analyticsService = inject(FundAnalyticsService);

  readonly holdings = input<ManualSelectionHolding[]>([]);
  readonly expandedIds = signal<Set<string>>(new Set());

  // Analytics data signals
  readonly rollingReturnsMap = signal<Map<string, RollingReturns>>(new Map());
  readonly riskInsightsMap = signal<Map<string, RiskInsights>>(new Map());
  readonly loadingIds = signal<Set<string>>(new Set());

  toggleExpand(fundId: string): void {
    const current = new Set(this.expandedIds());
    if (current.has(fundId)) {
      current.delete(fundId);
    } else {
      current.add(fundId);
      this.fetchAnalytics(fundId);
    }
    this.expandedIds.set(current);
  }

  isExpanded(fundId: string): boolean {
    return this.expandedIds().has(fundId);
  }

  // Fetch analytics on expand
  private fetchAnalytics(fundId: string): void {
    if (this.rollingReturnsMap().has(fundId)) return;

    const loading = new Set(this.loadingIds());
    loading.add(fundId);
    this.loadingIds.set(loading);

    this.analyticsService.getRollingReturns(fundId).subscribe({
      next: (returns) => {
        const map = new Map(this.rollingReturnsMap());
        map.set(fundId, returns);
        this.rollingReturnsMap.set(map);
      },
      complete: () => {
        const loading = new Set(this.loadingIds());
        loading.delete(fundId);
        this.loadingIds.set(loading);
      }
    });

    this.analyticsService.getRiskInsights(fundId).subscribe({
      next: (insights) => {
        const map = new Map(this.riskInsightsMap());
        map.set(fundId, insights);
        this.riskInsightsMap.set(map);
      }
    });
  }

  getRollingReturns(fundId: string): RollingReturns | undefined {
    return this.rollingReturnsMap().get(fundId);
  }

  getRiskInsights(fundId: string): RiskInsights | undefined {
    return this.riskInsightsMap().get(fundId);
  }

  isLoading(fundId: string): boolean {
    return this.loadingIds().has(fundId);
  }
}

