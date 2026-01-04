import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly chatService = inject(ChatService);

  selections: ManualSelectionItem[] = [{ weightPct: 0 }];
  totalWeight = 0;
  isLoading = false;
  resultData: ManualSelectionResponse | null = null;

  constructor() {
    this.chatService.isVisible.set(false);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  addRow(): void {
    // Only allow adding new row if current selections have at least one fund defined
    const hasEmptyRow = this.selections.some(
      item => !item.fundId && !item.fundName
    );
    
    if (!hasEmptyRow || this.selections.length === 0) {
      this.selections.push({ weightPct: 0 });
    }
  }

  removeRow(index: number): void {
    this.selections.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalWeight = this.selections.reduce((sum, item) => sum + (item.weightPct || 0), 0);
  }

  submit(): void {
    if (this.totalWeight !== 100) return;

    // Filter out selections that don't have either fundId or fundName
    const validSelections = this.selections.filter(
      item => (item.fundId && item.fundId.trim()) || (item.fundName && item.fundName.trim())
    );

    const payload = { selections: validSelections };
    this.isLoading = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.service.submitSelection(payload).subscribe({
      next: (response) => {
        this.resultData = response;
        this.isLoading = false;
        this.chatService.isVisible.set(true);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
