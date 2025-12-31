import { Injectable } from '@angular/core';
import { User } from '../models/auth.models';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private readonly authKeys = [TOKEN_KEY, USER_KEY];

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
        return !!(this.getToken() && this.getUser());
    }
}
