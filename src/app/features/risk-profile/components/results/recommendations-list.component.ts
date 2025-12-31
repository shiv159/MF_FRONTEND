import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendedAllocation } from '../../../../core/models/api.interface';

@Component({
  selector: 'app-recommendations-list',
  imports: [CommonModule],
  templateUrl: './recommendations-list.component.html',
  styleUrl: './recommendations-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationsListComponent {
  readonly recommendations = input<RecommendedAllocation[]>([]);
}
