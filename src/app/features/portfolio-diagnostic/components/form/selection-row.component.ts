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

  // Single source of truth for UI + payload is `item().fundName`.

  onFundSelected(fund: { schemeCode: number; schemeName: string }): void {
    const current = this.item();
    // User selected from results: send both id + name.
    current.fundId = String(fund.schemeCode);
    current.fundName = fund.schemeName;
    this.update.emit();
  }

  onFundCleared(): void {
    const current = this.item();
    current.fundId = undefined;
    current.fundName = undefined;
    this.update.emit();
  }

  onManualEntry(typedText: string): void {
    // User typed without selecting: use fundName only
    const current = this.item();
    current.fundId = undefined;
    current.fundName = typedText;
    this.update.emit();
  }

  onWeightChange(): void {
    this.update.emit();
  }
}
