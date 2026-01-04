import { Injectable } from '@angular/core';
import { User } from '../models/auth.models';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private readonly authKeys = [TOKEN_KEY, USER_KEY];

    private isJwtTokenValid(token: string): boolean {
        // Best-effort JWT exp validation. If it doesn't look like a JWT, treat as invalid.
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        try {
            const payloadJson = this.decodeBase64Url(parts[1]);
            const payload = JSON.parse(payloadJson) as { exp?: number };
            if (typeof payload.exp !== 'number') return false;

            // exp is seconds since epoch
            const nowSeconds = Math.floor(Date.now() / 1000);
            return payload.exp > nowSeconds;
        } catch {
            return false;
        }
    }

    private decodeBase64Url(base64Url: string): string {
        // Convert base64url to base64
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '='
        while (base64.length % 4 !== 0) base64 += '=';
        return atob(base64);
    }

    signOut(): void {
        // Only clear auth-related keys, not all localStorage
        this.authKeys.forEach(key => window.localStorage.removeItem(key));
    }

    saveToken(token: string): void {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.setItem(TOKEN_KEY, token);
    }

    getToken(): string | null {
        return window.localStorage.getItem(TOKEN_KEY);
    }

    hasValidToken(): boolean {
        const token = this.getToken();
        return !!(token && this.isJwtTokenValid(token));
    }

    saveUser(user: User): void {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    getUser(): User | null {
        const user = window.localStorage.getItem(USER_KEY);
        if (user) {
            try {
                return JSON.parse(user) as User;
            } catch {
                return null;
            }
        }
        return null;
    }

    hasValidSession(): boolean {
        return !!(this.hasValidToken() && this.getUser());
    }
}
