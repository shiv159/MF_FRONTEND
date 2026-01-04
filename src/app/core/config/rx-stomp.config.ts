import { RxStompConfig } from '@stomp/rx-stomp';
import { environment } from '../../../environments/environment';

function toWsUrl(httpUrl: string): string {
    // Convert http(s)://host[:port] to ws(s)://host[:port]
    // Keep path handling simple and append /ws for this app.
    const wsBase = httpUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
    return `${wsBase}/ws`;
}

export const rxStompConfig: RxStompConfig = {
    // Which server?
    brokerURL: toWsUrl(environment.apiUrl), // Overridden by webSocketFactory for SockJS support

    // Headers
    // Typical headers: login, passcode, host
    connectHeaders: {
        // Authorization will be added dynamically by the factory/service
    },

    // How often to heartbeat?
    // Interval in milliseconds, set to 0 to disable
    heartbeatIncoming: 0, // Typical value 0 - disabled
    heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

    // Wait in milliseconds before attempting auto reconnect
    // Set to 0 to disable
    // Typical value 500 (500 milli seconds)
    reconnectDelay: 200,

    // Will log diagnostics on console
    // It can be quite verbose, not recommended in production
    // Skip this key to stop logging to console
    debug: environment.production
        ? undefined
        : (msg: string): void => {
            console.log(new Date(), msg);
        },
};
