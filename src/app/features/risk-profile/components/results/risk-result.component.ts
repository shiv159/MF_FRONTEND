import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetAllocationChartComponent } from './asset-allocation-chart.component';
import { WealthProjectionChartComponent } from './wealth-projection-chart.component';
import { RecommendationsListComponent } from './recommendations-list.component';

@Component({
  selector: 'app-risk-result',
  imports: [
    CommonModule,
    AssetAllocationChartComponent,
    WealthProjectionChartComponent,
    RecommendationsListComponent
  ],
  templateUrl: './risk-result.component.html',
  styleUrl: './risk-result.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskResultComponent {
  readonly data = input<any>();
}
