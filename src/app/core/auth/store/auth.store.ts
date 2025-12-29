import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { User } from '../models/auth.models';
import { inject } from '@angular/core';
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

export const AuthStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store, tokenStorage = inject(TokenStorageService)) => ({
        loginSuccess(user: User, token: string) {
            tokenStorage.saveToken(token);
            tokenStorage.saveUser(user);
            patchState(store, { user, isAuthenticated: true, isLoading: false, error: null });
        },
        loginFailure(error: string) {
            patchState(store, { isLoading: false, error });
        },
        logout() {
            tokenStorage.signOut();
            patchState(store, { user: null, isAuthenticated: false });
        },
        setLoading(isLoading: boolean) {
            patchState(store, { isLoading });
        },
        initializeFromStorage() {
            const user = tokenStorage.getUser();
            const token = tokenStorage.getToken();
            if (user && token) {
                patchState(store, { user, isAuthenticated: true });
            }
        }
    }))
);
