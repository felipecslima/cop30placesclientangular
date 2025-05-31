import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = environment.token;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${ token }` } })
    : req;

  return next(authReq);
};
