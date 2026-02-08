import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-stepper',
    standalone: true,
    imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between w-full max-w-4xl mx-auto mb-6 sm:mb-8 relative gap-2 sm:gap-0">
      <!-- Background Line -->
      <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2 rounded"></div>
      
      <!-- Progress Line -->
      <div class="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transform -translate-y-1/2 rounded transition-all duration-500 ease-out"
           [style.width.%]="(currentStep / (steps.length - 1)) * 100"></div>

      <!-- Steps -->
      <div *ngFor="let step of steps; let i = index" 
           class="flex min-w-0 flex-col items-center cursor-pointer group"
           (click)="canNavigate && i < currentStep ? stepClicked.emit(i) : null">
        
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300 text-xs sm:text-base"
             [ngClass]="{
               'border-blue-600 text-blue-600': i <= currentStep,
               'border-gray-300 text-gray-400': i > currentStep,
               'bg-blue-600 text-white': i < currentStep || (i === currentStep && isCompleted)
             }">
          <ng-container *ngIf="i < currentStep; else numberConfig">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </ng-container>
          <ng-template #numberConfig>
            <span class="font-bold">{{ i + 1 }}</span>
          </ng-template>
        </div>
        
        <span class="mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 hidden lg:block"
              [ngClass]="{'text-blue-900': i <= currentStep, 'text-gray-400': i > currentStep}">
          {{ step }}
        </span>
      </div>
    </div>
  `
})
export class StepperComponent {
    @Input() steps: string[] = [];
    @Input() currentStep: number = 0;
    @Input() canNavigate: boolean = false;
    @Input() isCompleted: boolean = false;
    @Output() stepClicked = new EventEmitter<number>();
}
