import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManualSelectionItem } from '../../../../core/models/api.interface';
import { FundSearchComponent } from './fund-search.component';

@Component({
  selector: 'app-selection-row',
  imports: [CommonModule, FormsModule, FundSearchComponent],
  templateUrl: './selection-row.component.html',
  styleUrl: './selection-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectionRowComponent {
  readonly item = input.required<ManualSelectionItem>();
  readonly update = output<void>();
  readonly remove = output<void>();

  isManualMode = false;

  toggleMode(): void {
    this.isManualMode = !this.isManualMode;
  }

  onFundSelected(fund: { schemeCode: number; schemeName: string }): void {
    const current = this.item();
    current.fundId = String(fund.schemeCode);
    current.fundName = fund.schemeName;
    this.update.emit();
  }

  onWeightChange(): void {
    this.update.emit();
  }
}
