import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'landing',
        component: LandingComponent,
        canActivate: [authGuard]
    },
    {
        path: 'risk-profile',
        loadComponent: () => import('./features/risk-profile/pages/risk-profile.component').then(m => m.RiskProfileComponent),
        canActivate: [authGuard]
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'manual-selection',
        loadComponent: () => import('./features/portfolio-diagnostic/pages/manual-selection.component').then(m => m.ManualSelectionComponent),
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: '' }
];
