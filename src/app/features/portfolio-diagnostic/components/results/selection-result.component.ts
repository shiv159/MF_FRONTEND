import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManualSelectionResponse, TopHolding, PortfolioDiagnosticDTO } from '../../../../core/models/api.interface';
import { PortfolioSummaryComponent } from './portfolio-summary.component';
import { SectorChartComponent } from '../../../../shared/components/sector-chart.component';
import { HoldingsListComponent } from './holdings-list.component';
import { WealthProjectionChartComponent } from '../../../risk-profile/components/results/wealth-projection-chart.component';
import { StockValuationCardsComponent } from '../../../../shared/components/insights/stock-valuation-cards.component';
import { EsgDashboardComponent } from '../../../../shared/components/insights/esg-dashboard.component';
import { GeographicAllocationComponent } from '../../../../shared/components/insights/geographic-allocation.component';
import { FundActivityComponent } from '../../../../shared/components/insights/fund-activity.component';
import { SectorOverlapComponent } from '../sector-overlap/sector-overlap.component';
import { PortfolioDiagnosticReportComponent } from './portfolio-diagnostic-report.component';

@Component({
  selector: 'app-selection-result',
  imports: [
    CommonModule,
    PortfolioSummaryComponent,
    SectorChartComponent,
    HoldingsListComponent,
    WealthProjectionChartComponent,
    StockValuationCardsComponent,
    EsgDashboardComponent,
    GeographicAllocationComponent,
    GeographicAllocationComponent,
    FundActivityComponent,
    SectorOverlapComponent,
    PortfolioDiagnosticReportComponent
  ],
  templateUrl: './selection-result.component.html',
  styleUrl: './selection-result.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionResultComponent {
  readonly data = input.required<ManualSelectionResponse>();
  readonly diagnosticData = input<PortfolioDiagnosticDTO | null>();
  readonly isAnalyzing = input<boolean>(false);

  protected readonly aggregatedHoldings = computed<TopHolding[]>(() => {
    const portfolio = this.data().portfolio;
    if (!portfolio || !portfolio.holdings) return [];

    const allHoldings: TopHolding[] = [];

    portfolio.holdings.forEach(fund => {
      // If we don't have fund weight, assume equal or header weight
      const fundWeight = (fund.weightPct || 0) / 100;

      if (fund.topHoldings) {
        fund.topHoldings.forEach(stock => {
          // We clone the stock object to avoid mutating original data
          // and adjust weighting to reflect portfolio-level weight
          allHoldings.push({
            ...stock,
            weighting: (stock.weighting || 0) * fundWeight
          });
        });
      }
    });

    // Merge duplicates
    const merged = new Map<string, TopHolding>();
    allHoldings.forEach(h => {
      // Use ISIN as primary key, fallback to ticker or name
      const key = h.isin || h.ticker || h.securityName;
      if (merged.has(key)) {
        const existing = merged.get(key)!;
        existing.weighting += h.weighting;
      } else {
        merged.set(key, { ...h });
      }
    });

    return Array.from(merged.values()).sort((a, b) => b.weighting - a.weighting);
  });
}
