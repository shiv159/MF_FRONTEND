import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManualSelectionService } from '../services/manual-selection.service';
import { ManualSelectionItem, ManualSelectionResponse } from '../../../core/models/api.interface';
import { ThemeToggleComponent } from '../../../shared/components/ui/theme-toggle.component';

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

  selections: ManualSelectionItem[] = [{ weightPct: 0 }];
  totalWeight = 0;
  isLoading = false;
  resultData: ManualSelectionResponse | null = null;

  goBack(): void {
    this.router.navigate(['/']);
  }

  addRow(): void {
    this.selections.push({ weightPct: 0 });
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

    const payload = { selections: this.selections };
    this.isLoading = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.service.submitSelection(payload).subscribe({
      next: (response) => {
        this.resultData = response;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}
