import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PeerComparison } from '../../chat/models/chat.interface';

@Injectable({ providedIn: 'root' })
export class PeerService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/v1/peers`;

  comparison = signal<PeerComparison | null>(null);
  isLoading = signal(false);

  loadComparison(): void {
    this.isLoading.set(true);
    this.http.get<PeerComparison>(`${this.baseUrl}/compare`).subscribe({
      next: data => {
        this.comparison.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
