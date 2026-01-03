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
    constructor() {
        super();
    }
}

export function rxStompServiceFactory(tokenService: TokenStorageService): RxStompService {
    const rxStomp = new RxStompService();

    // Clone config
    const config = { ...rxStompConfig };

    // Helper to get token
    const token = tokenService.getToken();
    if (token) {
        config.connectHeaders = {
            Authorization: `Bearer ${token}`
        };
    }

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
