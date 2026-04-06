import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PortfolioBriefing } from '../../chat/models/chat.interface';

@Injectable({ providedIn: 'root' })
export class BriefingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/v1/briefings`;

  briefings = signal<PortfolioBriefing[]>([]);
  unreadCount = signal(0);
  isLoading = signal(false);

  hasUnread = computed(() => this.unreadCount() > 0);

  loadBriefings(): void {
    this.isLoading.set(true);
    this.http.get<PortfolioBriefing[]>(this.baseUrl).subscribe({
      next: briefings => {
        this.briefings.set(briefings);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadUnreadCount(): void {
    this.http.get<{ count: number }>(`${this.baseUrl}/unread/count`).subscribe({
      next: result => this.unreadCount.set(result.count),
      error: () => {}
    });
  }

  markAsRead(briefingId: string): void {
    this.http.put(`${this.baseUrl}/${briefingId}/read`, {}).subscribe({
      next: () => {
        this.briefings.update(list =>
          list.map(b => b.briefingId === briefingId ? { ...b, isRead: true } : b)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      }
    });
  }
}
