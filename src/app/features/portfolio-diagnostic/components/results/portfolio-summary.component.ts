import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioHealthDTO } from '../../../../core/models/api.interface';

@Component({
  selector: 'app-portfolio-summary',
  imports: [CommonModule],
  templateUrl: './portfolio-summary.component.html',
  styleUrl: './portfolio-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioSummaryComponent {
  readonly analysis = input.required<PortfolioHealthDTO>();
}
