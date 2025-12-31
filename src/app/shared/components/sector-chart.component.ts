import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoughnutChartComponent } from '../charts/doughnut-chart.component';

interface ProcessedSectorData {
  label: string;
  originalKey: string;
  value: number;
}

@Component({
  selector: 'app-sector-chart',
  imports: [CommonModule, DoughnutChartComponent],
  templateUrl: './sector-chart.component.html',
  styleUrl: './sector-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectorChartComponent {
  readonly sectors = input<Record<string, number>>({});

  protected readonly chartColors = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#6366f1', // indigo-500 (for Others)
  ];

  protected readonly processedData = computed<ProcessedSectorData[]>(() => {
    const entries = Object.entries(this.sectors())
      .map(([key, value]) => ({
        label: this.formatLabel(key),
        originalKey: key,
        value: value
      }))
      .sort((a, b) => b.value - a.value);

    // Take top 5 and group others
    if (entries.length > 5) {
      const top5 = entries.slice(0, 5);
      const othersSum = entries.slice(5).reduce((acc, curr) => acc + curr.value, 0);
      if (othersSum > 0) {
        top5.push({
          label: 'Others',
          originalKey: 'Others',
          value: parseFloat(othersSum.toFixed(2))
        });
      }
      return top5;
    }

    return entries;
  });

  protected readonly chartData = computed(() =>
    this.processedData().map(d => d.value)
  );

  protected readonly chartLabels = computed(() =>
    this.processedData().map(d => d.label)
  );

  private formatLabel(key: string): string {
    // Add space before capital letters and trim
    return key.replace(/([A-Z])/g, ' $1').trim();
  }
}
