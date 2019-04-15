import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  matchWithBody,
  matchWithBodyMatcher,
  matchWithHeader,
  matchWithMethod,
  matchWithUrl,
  matchWithParam,
  matchAll,
  matchAny
} from './matchers';
import { Observable } from 'rxjs';

describe('Request Matchers', () => {

  let mockHttpService: HttpClient;
  let httpMock: HttpTestingController;
  const doRequest = (req: Observable<any>) => req.subscribe(() => {});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        HttpClient,
        {
          provide: Store,
          useValue: {dispatch: jest.fn()}
        }
      ]
    });

    mockHttpService = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController);
  }));

  test('matchWithBody', () => {
    const body = {'params': {'key': 'value'}};
    const req = mockHttpService.post('', body);
    doRequest(req); httpMock.expectOne(matchWithBody(body));
    doRequest(req); httpMock.expectNone(matchWithBody({}));
  });

  test('matchWithBodyMatcher', () => {
    const body = {'params': {'key': 'value'}};
    const req = mockHttpService.post('', body);
    doRequest(req); httpMock.expectOne(matchWithBodyMatcher((b: any) => b.params.key === 'value'));
    doRequest(req); httpMock.expectNone(matchWithBodyMatcher((b: any) => b.params.key === 'other value'));
  });

  test('matchWithHeader', () => {
    const headername = 'Authorization';
    const headervalue = 'Bearer 12345';
    const req = mockHttpService.post('', '', {headers: {[headername]: headervalue}});

    doRequest(req); httpMock.expectOne(matchWithHeader(headername));
    doRequest(req); httpMock.expectOne(matchWithHeader(headername, headervalue));
    doRequest(req); httpMock.expectNone(matchWithHeader('blahblag'));
    doRequest(req); httpMock.expectNone(matchWithHeader('AuthorizationX', headervalue));
  });

  test('matchWithMethod', () => {
    const req = mockHttpService.put('', '');
    doRequest(req); httpMock.expectOne(matchWithMethod('PUT'));
    // case insensitive
    doRequest(req); httpMock.expectOne(matchWithMethod('put'));
    doRequest(req); httpMock.expectNone(matchWithMethod('GET'));
  });

  test('matchWithUrl', () => {
    const req = mockHttpService.get('/someurl');
    doRequest(req); httpMock.expectOne(matchWithUrl('some'));
    doRequest(req); httpMock.expectOne(matchWithUrl('someurl'));
    doRequest(req); httpMock.expectOne(matchWithUrl(new RegExp(/som[aeiou]url/)));
    doRequest(req); httpMock.expectNone(matchWithUrl('someotherurl'));
  });

  test('matchWithParam', () => {
    const params = new HttpParams().append('param1', 'val1').append('param2', 'val2');
    const req = mockHttpService.get('', {params});
    doRequest(req); httpMock.expectOne(matchWithParam('param1'));
    doRequest(req); httpMock.expectOne(matchWithParam('param1', 'val1'));
    doRequest(req); httpMock.expectOne(matchWithParam('param2'));
    doRequest(req); httpMock.expectNone(matchWithParam('param1', 'val2'));
    doRequest(req); httpMock.expectNone(matchWithParam('param3'));
  });

  test('matchAll', () => {
    const params = new HttpParams().append('param1', 'val1').append('param2', 'val2');
    const req = mockHttpService.get('', {params});

    doRequest(req);
    httpMock.expectOne(matchAll(
      matchWithParam('param1'),
      matchWithParam('param2', 'val2'),
      matchWithMethod('GET')
    ));

    doRequest(req);
    httpMock.expectNone(matchAll(
      matchWithParam('param1'),
      matchWithParam('param2', 'val2'),
      matchWithMethod('POST')
    ));

  });

  test('matchAny', () => {
    const body = {'params': {'key': 'value'}};
    const params = new HttpParams().append('param1', 'val1').append('param2', 'val2');
    const req = mockHttpService.post('', body, {params});

    doRequest(req);
    httpMock.expectOne(matchAny(
      matchWithParam('param3'),
      matchWithMethod('GET'),
      matchWithBody(body)
    ));

    doRequest(req);
    httpMock.expectNone(matchAny(
      matchWithParam('param3'),
      matchWithMethod('GET'),
      matchWithBody({})
    ));
  });

});
