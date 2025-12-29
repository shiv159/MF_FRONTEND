import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-recommendations-list',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h4 class="text-lg font-bold text-gray-800 mb-6">Recommended Funds</h4>
      <div class="space-y-4">
        <div *ngFor="let fund of recommendations" class="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              {{ fund.allocation }}%
            </div>
            <div>
              <div class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ fund.fundName }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">{{ fund.category }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium text-gray-600">Sharpe Ratio</div>
            <div class="font-bold text-gray-900">{{ fund.sharpe }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecommendationsListComponent {
    @Input() recommendations: any[] = [];
}
