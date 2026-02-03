import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

/**
 * OAuth callback component that handles the redirect from the backend
 * after successful Google authentication.
 * 
 * Expected URL format: /auth/callback?token=<jwt_token>
 */
@Component({
    selector: 'app-oauth-callback',
    imports: [CommonModule],
    template: `
        <div class="callback-container">
            <div class="loading-spinner">
                <svg class="animate-spin h-12 w-12" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                </svg>
            </div>
            <p class="loading-text">Completing sign in...</p>
            @if (error) {
                <p class="error-text">{{ error }}</p>
            }
        </div>
    `,
    styles: [`
        .callback-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: var(--color-background);
            color: var(--color-text);
        }
        
        .loading-spinner {
            color: var(--color-primary-500);
        }
        
        .loading-text {
            margin-top: 1rem;
            font-size: 1.125rem;
            color: var(--color-text-muted);
        }
        
        .error-text {
            margin-top: 0.5rem;
            color: var(--color-error);
        }
        
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `]
})
export class OAuthCallbackComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly authService = inject(AuthService);

    error: string | null = null;

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (token) {
            this.authService.handleOAuthCallback(token).subscribe({
                next: () => {
                    this.router.navigate(['/landing']);
                },
                error: (err) => {
                    this.error = err.error?.message || 'Failed to complete sign in. Please try again.';
                    setTimeout(() => {
                        this.router.navigate(['/auth/login']);
                    }, 3000);
                }
            });
        } else {
            this.error = 'No authentication token received.';
            setTimeout(() => {
                this.router.navigate(['/auth/login']);
            }, 2000);
        }
    }
}
