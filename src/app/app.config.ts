import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideMarkdown } from 'ngx-markdown';
import { jwtInterceptor } from './core/auth/interceptors/jwt.interceptor';
import { RxStompService, rxStompServiceFactory } from './core/services/rx-stomp.service';
import { TokenStorageService } from './core/auth/services/token-storage.service';
import { AuthStore } from './core/auth/store/auth.store';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAppInitializer(() => {
      const authStore = inject(AuthStore);
      authStore.initializeFromStorage();
    }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideCharts(withDefaultRegisterables()),
    provideMarkdown(),
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [TokenStorageService]
    }
  ]
};
