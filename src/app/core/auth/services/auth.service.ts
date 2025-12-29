import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.models';
import { AuthStore } from '../store/auth.store';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private store = inject(AuthStore);
    private apiHost = 'http://localhost:8080';
    private apiUrl = '/api/v1/auth';

    login(credentials: LoginRequest): Observable<AuthResponse> {
        this.store.setLoading(true);
        return this.http.post<AuthResponse>(`${this.apiHost}${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                const user = {
                    id: response.userId,
                    email: response.email,
                    name: response.fullName,
                    type: response.userType
                };
                this.store.loginSuccess(user, response.accessToken);
            }),
            catchError(error => {
                this.store.loginFailure(error.error?.message || 'Login failed');
                return throwError(() => error);
            })
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        this.store.setLoading(true);
        return this.http.post<AuthResponse>(`${this.apiHost}${this.apiUrl}/register`, data).pipe(
            tap(response => {
                const user = {
                    id: response.userId,
                    email: response.email,
                    name: response.fullName,
                    type: response.userType
                };
                this.store.loginSuccess(user, response.accessToken);
            }),
            catchError(error => {
                this.store.loginFailure(error.error?.message || 'Registration failed');
                return throwError(() => error);
            })
        );
    }

    logout() {
        this.store.logout();
    }
}
