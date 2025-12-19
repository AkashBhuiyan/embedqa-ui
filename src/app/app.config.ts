import { ApplicationConfig } from '@angular/core';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {httpErrorInterceptor} from "@core/interceptors/http-error.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
      provideHttpClient(withInterceptors([httpErrorInterceptor])),
  ]
};
