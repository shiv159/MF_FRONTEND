import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManualSelectionHolding } from '../../../../core/models/api.interface';

@Component({
  selector: 'app-holdings-list',
  imports: [CommonModule],
  templateUrl: './holdings-list.component.html',
  styleUrl: './holdings-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HoldingsListComponent {
  readonly holdings = input<ManualSelectionHolding[]>([]);
}
