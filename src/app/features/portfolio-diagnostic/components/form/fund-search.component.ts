import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
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

  readonly selectedFund = input<string>('');
  readonly disabled = input(false);
  readonly fundSelected = output<{ schemeCode: number; schemeName: string }>();
  readonly cleared = output<void>();

  searchTerm = '';
  results: any[] = [];
  showResults = false;
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.service.searchFunds(query))
    ).subscribe(results => {
      this.results = results;
      this.showResults = true;
    });
  }

  ngOnInit(): void {
    if (this.selectedFund()) {
      this.searchTerm = this.selectedFund();
    }
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  selectFund(fund: any): void {
    this.searchTerm = fund.name;
    this.showResults = false;
    this.fundSelected.emit({ schemeCode: fund.schemeCode, schemeName: fund.name });
  }

  clear(): void {
    this.searchTerm = '';
    this.results = [];
    this.cleared.emit();
  }
}
