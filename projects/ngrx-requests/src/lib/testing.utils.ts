import { NgrxRequestSuccess, NgrxRequestError } from './actions';
import { Matcher, Transformer } from './service';
import { HttpRequest } from '@angular/common/http';

export const makeHttpRequest = (path?: string) => new HttpRequest<any>('GET', path || 'some path');
export const makeHttpRequestMatcher = (req: HttpRequest<any> = makeHttpRequest()) => (match: HttpRequest<any>) => req.url === match.url;
export const makeMatcher = (
  matcher: Matcher = makeHttpRequestMatcher(),
  transform?: Transformer
) => ({matcher, transform});

export const successActionWithId = (id: string, meta?: any) => {
  const action = new NgrxRequestSuccess(meta);
  if (!meta) {
    delete action.meta;
  }
  action.id = id;
  return action;
};

export const errorActionWithId = (id: string, meta?: any) => {
  const action = new NgrxRequestError(meta);
  if (!meta) {
    delete action.meta;
  }
  action.id = id;
  return action;
};
