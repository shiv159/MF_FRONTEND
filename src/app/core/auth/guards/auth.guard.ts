import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
    const store = inject(AuthStore);
    const router = inject(Router);

    if (store.isAuthenticated()) {
        return true;
    }

    // Allow logic to check storage if state is empty (handled in App Init usually, but safeguard here)
    // For now, redirect to login
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
