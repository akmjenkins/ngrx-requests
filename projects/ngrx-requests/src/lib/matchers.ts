import { HttpRequest } from '@angular/common/http';
import { Matcher } from './service';

export const matchWithBody = <T>(body: T): Matcher => (req: HttpRequest<T>) => req.body === body;
export const matchWithBodyMatcher = <T>(fn: (body: T) => boolean): Matcher => (req: HttpRequest<T>) => fn(req.body);
export const matchWithHeader = (name: string, val?: string): Matcher =>
  (req: HttpRequest<any>) => val ? req.headers.get(name) === val : req.headers.has(name);

export const matchWithMethod = (method: string): Matcher => (req: HttpRequest<any>) => req.method.toLowerCase() === method.toLowerCase();
export const matchWithUrl = (url: string | RegExp): Matcher => (req: HttpRequest<any>) => !!req.urlWithParams.match(url);

export const matchWithParam = (name: string, val?: string): Matcher =>
  (req: HttpRequest<any>) => val ? req.params.get(name) === val : req.params.has(name);

export const matchAll = (...matchers: Matcher[]) => (req: HttpRequest<any>) => matchers.every(m => m(req));
export const matchAny = (...matchers: Matcher[]) => (req: HttpRequest<any>) => matchers.some(m => m(req));
