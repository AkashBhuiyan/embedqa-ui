import { ApplicationConfig } from '@angular/core';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {httpErrorInterceptor} from "@core/interceptors/http-error.interceptor";
import {provideRouter} from "@angular/router";
import {routes} from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
      provideHttpClient(withInterceptors([httpErrorInterceptor])),
      provideRouter(routes),
  ]
};
