import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NgrxRequestService, NgrxRequestMatcher } from './service';
import { Store } from '@ngrx/store';
import { NgrxRequestStart, NgrxRequestError, NgrxRequestSuccess, NgrxRequestAbort } from './actions';
import { catchError, finalize, tap } from 'rxjs/operators';
import { State } from './reducer';

@Injectable()
export class NgrxRequestInterceptor implements HttpInterceptor {

  constructor(
    private service: NgrxRequestService,
    private store: Store<State>
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const registered = this.service.interceptor(req);
    if (!registered) {
      return next.handle(req);
    }

    this.store.dispatch(new NgrxRequestStart(registered.id));

    let handled = true;
    return next.handle(req)
      .pipe(
        tap(e => {
          handled = this._handleResponse(e, registered);
        }),
        catchError(e => {
          handled = this._handleResponse(e, registered);
          return throwError(e);
        }),
        finalize(() => handled || this.store.dispatch(new NgrxRequestAbort(registered.id)))
      );

  }

  private _handleResponse(e: HttpEvent<any>, {id, transform}: NgrxRequestMatcher) {
    // not a response event
    if (!(e instanceof HttpResponseBase)) {
      return false;
    }

    let action: NgrxRequestSuccess | NgrxRequestError;
    try {
      action = new NgrxRequestSuccess(transform(<HttpResponse<any>>e));
    } catch (e) {
      action = new NgrxRequestError(e);
    }

    action.id = id;
    this.store.dispatch(action);
    return true;
  }
}
