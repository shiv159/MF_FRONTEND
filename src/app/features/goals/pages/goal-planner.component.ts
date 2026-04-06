import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../services/goal.service';
import { GoalPlan } from '../../chat/models/chat.interface';
import { ChatService } from '../../chat/services/chat.service';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-goal-planner',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button (click)="goBack()" class="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 mb-2 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Goal Planner</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Plan your financial goals with AI-powered SIP calculations</p>
        </div>

        <!-- Goal Form -->
        @if (!currentPlan()) {
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create a new goal</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Type</label>
                <select [(ngModel)]="goalType" class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3">
                  <option value="education">Child's Education</option>
                  <option value="retirement">Retirement</option>
                  <option value="house">House Purchase</option>
                  <option value="wedding">Wedding</option>
                  <option value="emergency">Emergency Fund</option>
                  <option value="travel">Travel</option>
                  <option value="car">Car Purchase</option>
                  <option value="custom">Custom Goal</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Name</label>
                <input [(ngModel)]="goalName" type="text" placeholder="e.g., Daughter's MBA"
                       class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Amount (₹)</label>
                <input [(ngModel)]="targetAmount" type="number" placeholder="5000000"
                       class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Date</label>
                <input [(ngModel)]="targetDate" type="date"
                       class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Savings (₹)</label>
                <input [(ngModel)]="currentSavings" type="number" placeholder="0"
                       class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3">
              </div>
            </div>

            <button (click)="createPlan()" [disabled]="goalService.isLoading()"
                    class="mt-8 w-full md:w-auto px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              @if (goalService.isLoading()) {
                <span class="animate-pulse">Calculating...</span>
              } @else {
                Calculate Plan
              }
            </button>
          </div>
        }

        <!-- Goal Plan Result -->
        @if (currentPlan(); as plan) {
          <div class="space-y-6">
            <!-- Summary Card -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ plan.goalSummary['goalName'] }}</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Target</p>
                  <p class="text-2xl font-bold text-primary-600 dark:text-primary-400">₹{{ formatLakhs(plan.goalSummary['targetAmount']) }}</p>
                </div>
                <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Monthly SIP</p>
                  <p class="text-2xl font-bold text-green-600 dark:text-green-400">₹{{ formatAmount(plan.sipPlan['requiredMonthlySip']) }}</p>
                </div>
                <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
                  <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ plan.goalSummary['yearsToGoal'] }}Y</p>
                </div>
                <div class="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Expected Return</p>
                  <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ plan.goalSummary['expectedReturnPct'] }}%</p>
                </div>
              </div>
            </div>

            <!-- Allocation -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Allocation</h3>
              <div class="flex gap-2 mb-3">
                @if (plan.allocationAdvice['equity']) {
                  <div class="flex-1 bg-blue-500 rounded-lg p-3 text-white text-center">
                    <p class="text-xs opacity-80">Equity</p>
                    <p class="text-lg font-bold">{{ plan.allocationAdvice['equity'] }}%</p>
                  </div>
                }
                @if (plan.allocationAdvice['debt']) {
                  <div class="flex-1 bg-green-500 rounded-lg p-3 text-white text-center">
                    <p class="text-xs opacity-80">Debt</p>
                    <p class="text-lg font-bold">{{ plan.allocationAdvice['debt'] }}%</p>
                  </div>
                }
                @if (plan.allocationAdvice['gold']) {
                  <div class="flex-1 bg-amber-500 rounded-lg p-3 text-white text-center">
                    <p class="text-xs opacity-80">Gold</p>
                    <p class="text-lg font-bold">{{ plan.allocationAdvice['gold'] }}%</p>
                  </div>
                }
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 italic">{{ plan.allocationAdvice['rationale'] }}</p>
            </div>

            <!-- Recommended Funds -->
            @if (plan.recommendedFunds.length > 0) {
              <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommended Funds</h3>
                <div class="space-y-3">
                  @for (fund of plan.recommendedFunds; track fund['fundId']) {
                    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ fund['fundName'] }}</p>
                        <div class="flex gap-2 mt-1">
                          <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{{ fund['category'] }}</span>
                          <span class="text-xs px-2 py-0.5 rounded-full"
                                [class]="fund['source'] === 'EXISTING_PORTFOLIO' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'">
                            {{ fund['source'] === 'EXISTING_PORTFOLIO' ? 'In Portfolio' : 'New' }}
                          </span>
                        </div>
                      </div>
                      @if (fund['expenseRatio']) {
                        <span class="text-sm text-gray-500 dark:text-gray-400">ER: {{ fund['expenseRatio'] }}%</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Actions -->
            <div class="flex gap-4">
              <button (click)="saveGoal()" class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                Save This Goal
              </button>
              <button (click)="askAI()" class="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
                Ask AI About This Plan
              </button>
              <button (click)="reset()" class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors">
                Plan Another Goal
              </button>
            </div>
          </div>
        }

        <!-- Existing Goals -->
        @if (goalService.goals().length > 0) {
          <div class="mt-12">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Goals</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (goal of goalService.goals(); track goal.goalId) {
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-700">
                  <div class="flex justify-between items-start mb-3">
                    <div>
                      <h3 class="font-semibold text-gray-900 dark:text-white">{{ goal.goalName }}</h3>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{{ goal.goalType }}</span>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full" [class]="goal.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ goal.status }}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div><span class="text-gray-500 dark:text-gray-400">Target:</span> <span class="font-medium text-gray-900 dark:text-white">₹{{ formatLakhs(goal.targetAmount) }}</span></div>
                    <div><span class="text-gray-500 dark:text-gray-400">SIP:</span> <span class="font-medium text-gray-900 dark:text-white">₹{{ formatAmount(goal.monthlySip) }}/mo</span></div>
                    <div><span class="text-gray-500 dark:text-gray-400">By:</span> <span class="font-medium text-gray-900 dark:text-white">{{ goal.targetDate }}</span></div>
                    <div><span class="text-gray-500 dark:text-gray-400">Return:</span> <span class="font-medium text-gray-900 dark:text-white">{{ goal.expectedReturnPct }}%</span></div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class GoalPlannerComponent {
  goalService = inject(GoalService);
  private chatService = inject(ChatService);

  goalType = 'education';
  goalName = '';
  targetAmount = 0;
  targetDate = '';
  currentSavings = 0;

  currentPlan = signal<GoalPlan | null>(null);

  constructor() {
    this.goalService.loadGoals();
  }

  createPlan(): void {
    if (!this.goalName || !this.targetAmount || !this.targetDate) return;
    this.goalService.createPlan({
      goalType: this.goalType,
      goalName: this.goalName,
      targetAmount: this.targetAmount,
      targetDate: this.targetDate,
      currentSavings: this.currentSavings
    }).subscribe(plan => this.currentPlan.set(plan));
  }

  saveGoal(): void {
    this.goalService.saveGoal({
      goalType: this.goalType,
      goalName: this.goalName,
      targetAmount: this.targetAmount,
      targetDate: this.targetDate,
      currentSavings: this.currentSavings
    }).subscribe(() => {
      this.goalService.loadGoals();
      this.reset();
    });
  }

  askAI(): void {
    this.chatService.setContext('GOAL_PLANNER', true);
    this.chatService.sendMessage(`Analyze my goal plan for ${this.goalName} — target ₹${this.targetAmount} by ${this.targetDate}`);
  }

  reset(): void {
    this.currentPlan.set(null);
    this.goalName = '';
    this.targetAmount = 0;
    this.targetDate = '';
    this.currentSavings = 0;
  }

  goBack(): void {
    window.history.back();
  }

  formatLakhs(amount: number): string {
    if (amount >= 10000000) return (amount / 10000000).toFixed(1) + ' Cr';
    if (amount >= 100000) return (amount / 100000).toFixed(1) + ' L';
    return amount.toLocaleString('en-IN');
  }

  formatAmount(amount: number): string {
    return Math.round(amount).toLocaleString('en-IN');
  }
}
