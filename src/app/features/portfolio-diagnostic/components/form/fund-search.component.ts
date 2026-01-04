import { Component, ChangeDetectionStrategy, ChangeDetectorRef, input, output, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManualSelectionService } from '../../services/manual-selection.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-fund-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './fund-search.component.html',
  styleUrl: './fund-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FundSearchComponent {
  private readonly service = inject(ManualSelectionService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly selectedFund = input<string>('');
  readonly disabled = input(false);
  readonly fundSelected = output<{ schemeCode: number; schemeName: string }>();
  readonly cleared = output<void>();
  readonly noResultsTyped = output<string>(); // Emit when user types but no catalog match

  searchTerm = signal('');
  results: any[] = [];
  showResults = false;
  private searchSubject = new Subject<string>();
  private typingTimer: any;
  private hasSelectedFromDropdown = false; // Track if user selected from results

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.service.searchFunds(query))
    ).subscribe(results => {
      this.results = results;
      this.showResults = true;
      this.cdr.markForCheck();
    });

    effect(() => {
      const fund = this.selectedFund();
      // Always sync searchTerm with parent's selectedFund
      this.searchTerm.set(fund || '');
      if (fund) {
        this.hasSelectedFromDropdown = true;
      }

      // Explicitly notify OnPush views.
      this.cdr.markForCheck();
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;

    // Keep signal in sync with the input element.
    this.searchTerm.set(query);
    
    // Reset selection flag when user starts typing again
    if (this.hasSelectedFromDropdown) {
      this.hasSelectedFromDropdown = false;
    }
    
    this.searchSubject.next(query);
    
    // Clear existing timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    // Wait for user to stop typing (1.5 seconds), then check if they should switch to manual
    if (query.length >= 3) {
      this.typingTimer = setTimeout(() => {
        // If user typed but no results or didn't select, suggest manual mode
        if (this.results.length === 0 && query.length > 0) {
          this.noResultsTyped.emit(query);
        }
      }, 1500);
    }
  }

  selectFund(fund: any): void {
    const id = fund.schemeCode || fund.scheme_code || fund.id || fund.isin || fund.fundId;
    const name = fund.name || fund.schemeName || fund.scheme_name || fund.fundName;

    // Set immediately so the user sees the selection right away,
    // then the parent `selectedFund` input will keep it in sync.
    this.searchTerm.set(name);
    this.showResults = false;
    this.hasSelectedFromDropdown = true; // Mark that user selected from dropdown
    this.fundSelected.emit({ schemeCode: id, schemeName: name });
    
    // Clear the typing timer since they selected something
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }

    this.cdr.markForCheck();
  }

  onResultMouseDown(event: MouseEvent, fund: any): void {
    // Runs before the input blur event; prevents the dropdown from closing
    // before the selection is applied.
    event.preventDefault();
    event.stopPropagation();
    this.selectFund(fund);
  }

  onBlur(): void {
    // Delay to allow click on results
    setTimeout(() => {
      this.showResults = false;
      
      // If they typed something but didn't select from results, suggest manual mode
      const term = this.searchTerm();
      if (term.length >= 3 && !this.hasSelectedFromDropdown) {
        this.noResultsTyped.emit(term);
      }
      
      this.cdr.markForCheck();
    }, 200);
  }

  clear(): void {
    this.searchTerm.set('');
    this.results = [];
    this.hasSelectedFromDropdown = false;
    this.cleared.emit();
  }
}
