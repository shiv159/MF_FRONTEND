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
  readonly index = input.required<number>();
  readonly item = input.required<ManualSelectionItem>();
  readonly update = output<{ index: number; item: ManualSelectionItem }>();
  readonly remove = output<number>();

  // Single source of truth for UI + payload is `item().fundName`.

  onFundSelected(fund: { schemeCode: string | number; schemeName: string }): void {
    const current = this.item();
    const updated: ManualSelectionItem = {
      ...current,
      fundId: String(fund.schemeCode),
      fundName: fund.schemeName
    };
    this.update.emit({ index: this.index(), item: updated });
  }

  onFundCleared(): void {
    const current = this.item();
    const updated: ManualSelectionItem = { ...current, fundId: undefined, fundName: undefined };
    this.update.emit({ index: this.index(), item: updated });
  }

  onManualEntry(typedText: string): void {
    const current = this.item();
    const updated: ManualSelectionItem = { ...current, fundId: undefined, fundName: typedText };
    this.update.emit({ index: this.index(), item: updated });
  }

  onWeightInput(event: Event): void {
    const nextWeight = +((event.target as HTMLInputElement).value || 0);
    const current = this.item();
    const updated: ManualSelectionItem = { ...current, weightPct: nextWeight };
    this.update.emit({ index: this.index(), item: updated });
  }

  onRemove(): void {
    this.remove.emit(this.index());
  }
}
