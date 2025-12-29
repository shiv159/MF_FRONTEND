import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weight-total',
  imports: [CommonModule],
  templateUrl: './weight-total.component.html',
  styleUrl: './weight-total.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeightTotalComponent {
  readonly total = input<number>(0);

  get progressWidth(): string {
    return `${Math.min(this.total(), 100)}%`;
  }

  get isComplete(): boolean {
    return this.total() === 100;
  }

  get isOver(): boolean {
    return this.total() > 100;
  }
}
