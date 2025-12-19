import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to server. Please check if the backend is running.';
        } else if (error.status === 400) {
          errorMessage = 'Bad request. Please check your input.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please check your credentials.';
        } else if (error.status === 403) {
          errorMessage = 'Access forbidden.';
        } else if (error.status === 404) {
          errorMessage = 'Resource not found.';
        } else if (error.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        } else if (error.status === 502) {
          errorMessage = 'Bad gateway. Server is temporarily unavailable.';
        } else if (error.status === 503) {
          errorMessage = 'Service unavailable. Please try again later.';
        }
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url
      });

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
