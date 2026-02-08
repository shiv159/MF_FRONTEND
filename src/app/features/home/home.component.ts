import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/ui/theme-toggle.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ThemeToggleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent { }
