import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectorOverlap } from '../../../../core/models/api.interface';

@Component({
    selector: 'app-sector-overlap',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sector-overlap.component.html',
    styleUrl: './sector-overlap.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectorOverlapComponent {
    readonly overlaps = input<SectorOverlap[]>([]);

    // Simple string hashing for consistent colors
    getColor(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 50%)`;
    }
}
