import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../models/auth.models';
import { TokenStorageService } from '../services/token-storage.service';

type AuthState = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
};

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
    private readonly tokenStorage = inject(TokenStorageService);
    private readonly state = signal<AuthState>(initialState);

    readonly user = computed(() => this.state().user);
    readonly isAuthenticated = computed(() => this.state().isAuthenticated);
    readonly isLoading = computed(() => this.state().isLoading);
    readonly error = computed(() => this.state().error);

    loginSuccess(user: User, token: string): void {
        this.tokenStorage.saveToken(token);
        this.tokenStorage.saveUser(user);
        this.patch({ user, isAuthenticated: true, isLoading: false, error: null });
    }

    loginFailure(error: string): void {
        this.patch({ isLoading: false, error });
    }

    logout(): void {
        this.tokenStorage.signOut();
        this.patch({ user: null, isAuthenticated: false });
    }

    setLoading(isLoading: boolean): void {
        this.patch({ isLoading });
    }

    initializeFromStorage(): void {
        const user = this.tokenStorage.getUser();
        if (user && this.tokenStorage.hasValidToken()) {
            this.patch({ user, isAuthenticated: true });
        }
    }

    private patch(partial: Partial<AuthState>): void {
        this.state.update(current => ({ ...current, ...partial }));
    }
}
