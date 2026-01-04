import { Component, ChangeDetectionStrategy, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManualSelectionService } from '../services/manual-selection.service';
import { ManualSelectionItem, ManualSelectionResponse } from '../../../core/models/api.interface';
import { ThemeToggleComponent } from '../../../shared/components/ui/theme-toggle.component';
import { ChatService } from '../../chat/services/chat.service';

import { SelectionRowComponent } from '../components/form/selection-row.component';
import { WeightTotalComponent } from '../components/form/weight-total.component';
import { SelectionResultComponent } from '../components/results/selection-result.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton.component';

@Component({
  selector: 'app-manual-selection',
  imports: [
    CommonModule,
    FormsModule,
    ThemeToggleComponent,
    SelectionRowComponent,
    WeightTotalComponent,
    SelectionResultComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './manual-selection.component.html',
  styleUrl: './manual-selection.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualSelectionComponent {
  private readonly router = inject(Router);
  private readonly service = inject(ManualSelectionService);
  private readonly chatService = inject(ChatService);

  readonly selections = signal<ManualSelectionItem[]>([{ weightPct: 0 }]);
  readonly totalWeight = computed(() =>
    this.selections().reduce((sum, item) => sum + (item.weightPct || 0), 0)
  );

  readonly isLoading = signal(false);
  readonly resultData = signal<ManualSelectionResponse | null>(null);

  constructor() {
    this.chatService.isVisible.set(false);
  }

  goBack(): void {
    this.chatService.isVisible.set(false);
    this.router.navigate(['/landing']);
  }

  ngOnDestroy(): void {
    this.chatService.isVisible.set(false);
  }

  addRow(): void {
    const current = this.selections();

    // Only allow adding new row if there isn't an empty row already.
    const hasEmptyRow = current.some(item => !item.fundId && !item.fundName);
    if (hasEmptyRow && current.length > 0) return;

    this.selections.set([...current, { weightPct: 0 }]);
  }

  removeRow(index: number): void {
    const current = this.selections();
    this.selections.set(current.filter((_, i) => i !== index));
  }

  onRowUpdate(event: { index: number; item: ManualSelectionItem }): void {
    this.selections.update(current =>
      current.map((existing, i) => (i === event.index ? event.item : existing))
    );
  }

  submit(): void {
    if (this.totalWeight() !== 100) return;

    // Filter out selections that don't have either fundId or fundName
    const validSelections = this.selections().filter(
      item => (item.fundId && item.fundId.trim()) || (item.fundName && item.fundName.trim())
    );

    const payload = { selections: validSelections };
    this.isLoading.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.service.submitSelection(payload).subscribe({
      next: (response) => {
        this.resultData.set(response);
        this.isLoading.set(false);
        this.chatService.isVisible.set(true);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }
}
