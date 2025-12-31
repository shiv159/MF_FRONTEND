import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LineChartComponent } from '../../../../shared/charts/line-chart.component';
import { YearProjection } from '../../../../core/models/api.interface';

@Component({
  selector: 'app-wealth-projection-chart',
  imports: [CommonModule, LineChartComponent],
  templateUrl: './wealth-projection-chart.component.html',
  styleUrl: './wealth-projection-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WealthProjectionChartComponent {
  readonly timeline = input<YearProjection[]>([]);
}
