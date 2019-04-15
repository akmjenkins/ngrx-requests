import { Store } from '@ngrx/store';
import { TestBed, async } from '@angular/core/testing';
import { NgrxRequestInterceptor } from './interceptor';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpResponse } from '@angular/common/http';
import { errorActionWithId, successActionWithId, makeMatcher, makeHttpRequestMatcher, makeHttpRequest } from './testing.utils';
import { NgrxRequestService } from './service';
import { NgrxRequestStart, NgrxRequestAbort, NgrxRequestSuccess, NgrxRequestError } from './actions';
import { Observable } from 'rxjs';

describe('Request Interceptor', () => {

  let interceptor: NgrxRequestInterceptor;
  let mockHttpService: HttpClient;
  let requestService: NgrxRequestService;
  let httpMock: HttpTestingController;
  const dispatch = jest.fn();
  const select = jest.fn();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        NgrxRequestService,
        HttpClient,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: NgrxRequestInterceptor,
          multi: true
        },
        {
          provide: Store,
          useValue: {dispatch, select}
        }
      ]
    });

    interceptor = TestBed.get(HTTP_INTERCEPTORS).find((int: any) => int instanceof NgrxRequestInterceptor);
    mockHttpService = TestBed.get(HttpClient);
    requestService = TestBed.get(NgrxRequestService);
    httpMock = TestBed.get(HttpTestingController);
    dispatch.mockClear();
  }));


  test('should be truthy', () => {
    expect(interceptor).toBeTruthy();
  });

  test('it should intercept', () => {
    jest.spyOn(interceptor, 'intercept');
    mockHttpService.get('').subscribe(() => {});
    expect(interceptor.intercept).toHaveBeenCalledTimes(1);
  });

  test('it should request a matching intercept from requestService using the request', () => {
    const path = 'my path';
    const spy = jest.spyOn(requestService, 'interceptor');
    mockHttpService.get(path).subscribe(() => {});
    const req = httpMock.match(path)[0];
    expect(spy).toHaveBeenCalledWith(req.request);
  });

  test('should continue the request if no matcher is registered in request service', () => {
    const path = 'my path';
    const spy = jest.spyOn(requestService, 'interceptor');
    mockHttpService.get(path).subscribe(() => {});
    httpMock.expectOne(path);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveReturnedWith(undefined);
  });

  test('should continue the request if a matcher has been found in request service', () => {
    const path = 'my path';
    const matcher = makeMatcher(makeHttpRequestMatcher(makeHttpRequest(path)));
    const spy = jest.spyOn(requestService, 'interceptor');
    requestService.register(matcher);
    mockHttpService.get(path).subscribe(() => {});
    httpMock.expectOne(path);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveReturnedWith(expect.objectContaining({matcher: matcher.matcher}));
  });

  test('should not dispatch anything if no matcher found', () => {
    mockHttpService.get('').subscribe(() => {});
    expect(dispatch).not.toHaveBeenCalled();
  });

  describe('matcher found', () => {

    const path = 'my path';
    const matcher = makeMatcher(makeHttpRequestMatcher(makeHttpRequest(path)));
    let dispose: () => void;
    let id: string;

    beforeEach(() => {
      const reg = requestService.register(matcher);
      dispose = reg.dispose;
      id = reg.id;
    });

    afterEach(() => {
      dispatch.mockClear();
      dispose();

      // this removes the request from the HttpClientTestingBackend
      // in case our test hasn't already removed it
      httpMock.match(path);
    });

    test('should dispatch request start', () => {
      mockHttpService.get(path).subscribe(() => {});
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(new NgrxRequestStart(id));
    });

    test('should dispatch success', () => {
      mockHttpService.get(path).subscribe(() => {});
      const [req] = httpMock.match(path);
      req.flush('', {status: 200, statusText: 'ok'});
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining(successActionWithId(id)));
    });

    test('should dispatch error', () => {
      mockHttpService.get(path).subscribe(() => {}, () => {});
      const [req] = httpMock.match(path);
      req.error(new ErrorEvent('fail'));
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(expect.objectContaining(errorActionWithId(id)));
    });

    test('should rethrow error if error', done => {
      mockHttpService.get(path).subscribe(
          () => {},
          e => done()
        );
      const [req] = httpMock.match(path);
      req.error(new ErrorEvent('fail'));
    });

    test('should dispatch canceled', () => {
      const s = mockHttpService.get(path).subscribe(() => {});
      s.unsubscribe();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(new NgrxRequestAbort(id));
    });

    describe('transform', () => {

      let req$: Observable<Object>;
      let transformer: (r: HttpResponse<any>) => any = r => null;
      let _dispose: () => void;
      let _id: string;
      const transform = jest.fn((r: HttpResponse<any>) => transformer(r));
      const matcherPath = 'my other path';
      const transformMatcher = makeMatcher(
        makeHttpRequestMatcher(makeHttpRequest(matcherPath)),
        transform
      );

      const subscribe = () => req$.subscribe(() => {}, () => {});
      const getRequest = () => httpMock.match(matcherPath)[0];

      beforeEach(() => {
        // register the matcher
        const reg = requestService.register(transformMatcher);
        _dispose = reg.dispose;
        _id = reg.id;

        // set up the request
        req$ = mockHttpService.get(matcherPath);
      });

      afterEach(() => {

        // unregister matchers
        _dispose();

        // clean mock
        transform.mockClear();

        // remove any open requests
        getRequest();
      });


      test('should call transform with the response from the request', () => {
        subscribe();
        const body = 'some response';
        transformer = () => body;
        getRequest().flush(body);
        expect(transform).toHaveBeenCalledTimes(1);
        expect(transform).toHaveBeenCalledWith(expect.objectContaining({body}));
      });

      test('should use the response from transform on success', () => {
        subscribe();
        const body = 'some response';
        const meta = 'heres some meta';
        transformer = () => meta;
        const success = new NgrxRequestSuccess(meta);
        getRequest().flush(body);
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining(success));
      });

      test('should use the response from transform on error', () => {
        subscribe();
        const meta = 'heres some meta';
        transformer = () => meta;
        const success = new NgrxRequestSuccess(meta);
        getRequest().error(new ErrorEvent('failed'));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining(success));
      });

      test('should dispatch RequestError when an error is thrown from inside the transformer', () => {
        subscribe();
        const meta = 'heres some meta';
        transformer = () => { throw meta; };
        getRequest().flush('some body');
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining(new NgrxRequestError(meta)));
      });

    });

  });

});
