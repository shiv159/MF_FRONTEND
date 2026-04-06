import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GoalPlan, UserGoal } from '../../chat/models/chat.interface';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/v1/goals`;

  goals = signal<UserGoal[]>([]);
  isLoading = signal(false);

  createPlan(request: {
    goalType: string;
    goalName: string;
    targetAmount: number;
    targetDate: string;
    currentSavings: number;
  }): Observable<GoalPlan> {
    this.isLoading.set(true);
    return this.http.post<GoalPlan>(`${this.baseUrl}/plan`, request).pipe(
      tap({ finalize: () => this.isLoading.set(false) })
    );
  }

  saveGoal(request: {
    goalType: string;
    goalName: string;
    targetAmount: number;
    targetDate: string;
    currentSavings: number;
  }): Observable<UserGoal> {
    return this.http.post<UserGoal>(`${this.baseUrl}/save`, request);
  }

  loadGoals(): void {
    this.isLoading.set(true);
    this.http.get<UserGoal[]>(this.baseUrl).subscribe({
      next: goals => {
        this.goals.set(goals);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getActiveGoals(): Observable<UserGoal[]> {
    return this.http.get<UserGoal[]>(`${this.baseUrl}/active`);
  }
}
