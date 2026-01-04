import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { rxStompConfig } from '../config/rx-stomp.config';
import SockJS from 'sockjs-client';
import { TokenStorageService } from '../auth/services/token-storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class RxStompService extends RxStomp {
    constructor(private readonly tokenStorage: TokenStorageService) {
        super();
    }

    async reconnectWithLatestToken(): Promise<void> {
        // Force a reconnect so the server receives fresh Authorization headers.
        // This is especially useful right after login/logout.
        await this.deactivate();
        this.activate();
    }

    refreshConnectHeaders(): void {
        const token = this.tokenStorage.getToken();
        this.stompClient.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    }
}

export function rxStompServiceFactory(tokenService: TokenStorageService): RxStompService {
    const rxStomp = new RxStompService(tokenService);

    // Clone config
    const config = { ...rxStompConfig };

    config.beforeConnect = async () => {
        // Runs on every (re)connect. Ensures latest token is used.
        const token = tokenService.getToken();
        config.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
        rxStomp.refreshConnectHeaders();
    };

    // Use SockJS
    config.webSocketFactory = () => {
        // Ensure we use http/https for SockJS, not ws/wss
        const url = environment.apiUrl.replace('ws://', 'http://').replace('wss://', 'https://') + '/ws';
        return new SockJS(url);
    };

    rxStomp.configure(config);
    rxStomp.activate();

    return rxStomp;
}
