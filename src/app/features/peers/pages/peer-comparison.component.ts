import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeerService } from '../services/peer.service';

@Component({
  selector: 'app-peer-comparison',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <button (click)="goBack()" class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-2 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Peer Comparison</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">See how your portfolio stacks up against similar investors</p>
        </div>

        @if (peerService.isLoading()) {
          <div class="animate-pulse space-y-4">
            <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          </div>
        } @else if (peerService.comparison(); as data) {
          <div class="space-y-6">
            <!-- Profile Badge -->
            <div class="flex gap-3">
              <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">{{ data.riskProfile }} Profile</span>
              <span class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">{{ data.portfolioSizeBracket }} Portfolio</span>
            </div>

            <!-- Comparison Table -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-700">
                    <th class="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Metric</th>
                    <th class="text-center p-4 text-sm font-medium text-primary-600 dark:text-primary-400">You</th>
                    <th class="text-center p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Peers (avg)</th>
                    <th class="text-center p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of comparisonRows(); track row.label) {
                    <tr class="border-b border-gray-50 dark:border-gray-700/50">
                      <td class="p-4 text-sm text-gray-700 dark:text-gray-300">{{ row.label }}</td>
                      <td class="p-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{{ row.you }}</td>
                      <td class="p-4 text-center text-sm text-gray-500 dark:text-gray-400">{{ row.peers }}</td>
                      <td class="p-4 text-center">
                        <span class="text-xs px-2 py-1 rounded-full font-medium"
                              [class]="row.verdict === 'BETTER' || row.verdict === 'OUTPERFORMING' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : row.verdict === 'WORSE' || row.verdict === 'UNDERPERFORMING' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'">
                          {{ row.verdict }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            @if (data.peers['note']) {
              <p class="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">{{ data.peers['note'] }}</p>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PeerComparisonComponent {
  peerService = inject(PeerService);

  constructor() {
    this.peerService.loadComparison();
  }

  comparisonRows() {
    const data = this.peerService.comparison();
    if (!data) return [];
    return [
      { label: 'Equity Allocation', you: data.you['equityPct'] + '%', peers: data.peers['equityPct'] + '%', verdict: Math.abs(data.you['equityPct'] as number - (data.peers['equityPct'] as number)) < 10 ? 'SIMILAR' : 'DIFFERENT' },
      { label: 'Debt Allocation', you: data.you['debtPct'] + '%', peers: data.peers['debtPct'] + '%', verdict: 'SIMILAR' },
      { label: 'Expense Ratio', you: data.you['avgExpenseRatio'] + '%', peers: data.peers['avgExpenseRatio'] + '%', verdict: data.highlights['expenseRatioVsPeers'] },
      { label: 'Fund Count', you: String(data.you['fundCount']), peers: String(data.peers['avgFundCount']), verdict: data.highlights['diversificationVsPeers'] },
      { label: 'Returns', you: data.you['returnPct'] + '%', peers: data.peers['returnPct'] + '%', verdict: data.highlights['returnsVsPeers'] },
    ];
  }

  goBack(): void {
    window.history.back();
  }
}
