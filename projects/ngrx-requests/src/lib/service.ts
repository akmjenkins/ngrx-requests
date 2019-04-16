import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { NgrxRequestClear } from './actions';
import { Store } from '@ngrx/store';
import * as selectors from './selectors';
import { Observable } from 'rxjs';
import { NgrxRequest, NgrxRequestStatus } from './reducer';

export type Matcher = (req: HttpRequest<any>) => boolean;
export type Transformer = (res: HttpResponse<any> | HttpErrorResponse) => any;

export interface NgrxRequestMatcher {
  id: string;
  matcher: Matcher;
  transform?: Transformer;
}

export interface NgrxRequestData {
  id: string;
  request$: Observable<NgrxRequest>;
  meta$: Observable<any>;
  status$: Observable<NgrxRequestStatus>;
  isIdle$: Observable<boolean>;
  isCanceled$: Observable<boolean>;
  isError$: Observable<boolean>;
  isSuccess$: Observable<boolean>;
  isWorking$: Observable<boolean>;
  dispose: () => void;
}

const DEFAULT_TRANSFORM = (r: HttpResponse<any>) => {
  if (r instanceof HttpErrorResponse) {
    throw r;
  }
  return r;
};

@Injectable({
  providedIn: 'root'
})
export class NgrxRequestService {

  private matchers: Map<string, NgrxRequestMatcher> = new Map();
  constructor(private store: Store<any>) {}

  register(matcher: Matcher, transform?: Transformer): NgrxRequestData {
    const id = this.matchers.size.toString();
    this.matchers.set(
      id,
      {
        id,
        matcher,
        transform: transform || DEFAULT_TRANSFORM
      }
    );

    return {
      id,
      request$: this.store.select(...selectors.request(id)),
      meta$: this.store.select(...selectors.requestMeta(id)),
      status$: this.store.select(...selectors.requestStatus(id)),
      isIdle$: this.store.select(...selectors.isIdle(id)),
      isCanceled$: this.store.select(...selectors.isCanceled(id)),
      isError$: this.store.select(...selectors.isError(id)),
      isSuccess$: this.store.select(...selectors.isSuccess(id)),
      isWorking$: this.store.select(...selectors.isWorking(id)),
      dispose: () => {
        if (this.matchers.delete(id)) {
          this.store.dispatch(new NgrxRequestClear(id));
        }
      }
    };

  }

  interceptor(req: HttpRequest<any>): NgrxRequestMatcher {
    return Array.from(this.matchers.values()).find(m => m.matcher(req));
  }

}
