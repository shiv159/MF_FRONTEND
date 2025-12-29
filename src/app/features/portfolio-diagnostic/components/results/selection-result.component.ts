import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManualSelectionResponse } from '../../../../core/models/api.interface';
import { PortfolioSummaryComponent } from './portfolio-summary.component';
import { SectorChartComponent } from './sector-chart.component';
import { HoldingsListComponent } from './holdings-list.component';
import { WealthProjectionChartComponent } from '../../../risk-profile/components/results/wealth-projection-chart.component';

@Component({
  selector: 'app-selection-result',
  imports: [
    CommonModule,
    PortfolioSummaryComponent,
    SectorChartComponent,
    HoldingsListComponent,
    WealthProjectionChartComponent
  ],
  templateUrl: './selection-result.component.html',
  styleUrl: './selection-result.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionResultComponent {
  readonly data = input.required<ManualSelectionResponse>();
}
