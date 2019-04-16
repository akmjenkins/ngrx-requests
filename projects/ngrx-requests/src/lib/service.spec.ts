import { NgrxRequestService } from './service';
import { Store } from '@ngrx/store';
import { TestBed, async } from '@angular/core/testing';
import { NgrxRequestClear } from './actions';
import { makeMatcher, makeHttpRequest, makeHttpRequestMatcher } from './testing.utils';

describe('Request Service', () => {

  const dispatch = jest.fn();
  const select = jest.fn();
  let service: NgrxRequestService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        NgrxRequestService,
        { provide: Store, useValue: {dispatch, select} }
      ]
    });
    service = TestBed.get(NgrxRequestService);
    dispatch.mockClear();
  }));

  test('should be truthy', () => {
    expect(service).toBeTruthy();
  });

  test('should return an unregister function that dispatches on register', () => {
    const matcher = makeMatcher();
    const {id, dispose} = service.register(matcher.matcher, matcher.transform);
    dispose();
    expect(dispatch).toHaveBeenCalledWith(new NgrxRequestClear(id));
  });

  test('should only dispatch once if dispose is called more than once', () => {
    const matcher = makeMatcher();
    const {id, dispose} = service.register(matcher.matcher, matcher.transform);
    dispose();
    dispose();
    dispose();
    expect(dispatch).toHaveBeenCalledWith(new NgrxRequestClear(id));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  test('should return the correct matcher from interceptor', () => {
    const path = makeHttpRequest('path 1');
    const matcher = makeMatcher(makeHttpRequestMatcher(path));
    service.register(matcher.matcher, matcher.transform);
    expect(service.interceptor(path)).toEqual(expect.objectContaining({matcher: matcher.matcher}));
  });

  test('should return falsy from matcher if no interceptor found', () => {
    const matcher = makeMatcher(makeHttpRequestMatcher(makeHttpRequest('path one')));
    service.register(matcher.matcher, matcher.transform);
    expect(service.interceptor(makeHttpRequest('path two'))).toBeFalsy();
  });

  test('should return null from interceptor method after a matcher has been unregistered', () => {
    const path = makeHttpRequest('path 1');
    const matcher = makeMatcher(makeHttpRequestMatcher(path));
    const unregister = service.register(matcher.matcher, matcher.transform).dispose;
    expect(service.interceptor(path)).toEqual(expect.objectContaining({matcher: matcher.matcher}));
    unregister();
    expect(service.interceptor(path)).toBeFalsy();
  });

});
