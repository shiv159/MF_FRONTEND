import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models/auth.models';
import { AuthStore } from '../store/auth.store';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../../../environments/environment';
import { RxStompService } from '../../services/rx-stomp.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly store = inject(AuthStore);
    private readonly rxStompService = inject(RxStompService);
    private readonly tokenStorage = inject(TokenStorageService);
    private readonly apiUrl = `${environment.apiUrl}/api/v1/auth`;

    login(credentials: LoginRequest): Observable<AuthResponse> {
        this.store.setLoading(true);
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                const user: User = {
                    id: response.userId,
                    email: response.email,
                    name: response.fullName,
                    type: response.userType,
                    authProvider: response.authProvider
                };
                this.store.loginSuccess(user, response.accessToken!);
                void this.rxStompService.reconnectWithLatestToken();
            }),
            catchError(error => {
                this.store.loginFailure(error.error?.message || 'Login failed');
                return throwError(() => error);
            })
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        this.store.setLoading(true);
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap(response => {
                const user: User = {
                    id: response.userId,
                    email: response.email,
                    name: response.fullName,
                    type: response.userType,
                    authProvider: response.authProvider
                };
                this.store.loginSuccess(user, response.accessToken!);
                void this.rxStompService.reconnectWithLatestToken();
            }),
            catchError(error => {
                this.store.loginFailure(error.error?.message || 'Registration failed');
                return throwError(() => error);
            })
        );
    }

    /**
     * Redirects to backend OAuth2 authorization endpoint for Google login.
     */
    loginWithGoogle(): void {
        window.location.href = `${environment.apiUrl}/oauth2/authorization/google`;
    }

    /**
     * Fetches the current user's profile using the JWT token.
     * Used after OAuth callback to get user details.
     */
    getUserProfile(): Observable<AuthResponse> {
        return this.http.get<AuthResponse>(`${this.apiUrl}/me`);
    }

    /**
     * Handles OAuth callback by saving the token and fetching user profile.
     * @param token JWT token received from OAuth callback
     */
    handleOAuthCallback(token: string): Observable<AuthResponse> {
        // First save the token so subsequent requests are authenticated
        this.store.setLoading(true);

        // Save token using the storage service to ensure consistent key usage
        this.tokenStorage.saveToken(token);

        return this.getUserProfile().pipe(
            tap(response => {
                const user: User = {
                    id: response.userId,
                    email: response.email,
                    name: response.fullName,
                    type: response.userType,
                    authProvider: response.authProvider
                };
                this.store.loginSuccess(user, token);
                void this.rxStompService.reconnectWithLatestToken();
            }),
            catchError(error => {
                // Clear invalid token
                this.tokenStorage.signOut();
                this.store.loginFailure(error.error?.message || 'OAuth login failed');
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        void this.rxStompService.deactivate();
        this.store.logout();
    }
}

