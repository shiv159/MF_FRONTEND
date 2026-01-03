import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideMarkdown } from 'ngx-markdown';
import { jwtInterceptor } from './core/auth/interceptors/jwt.interceptor';
import { RxStompService, rxStompServiceFactory } from './core/services/rx-stomp.service';
import { TokenStorageService } from './core/auth/services/token-storage.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
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
