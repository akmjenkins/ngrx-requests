[![NPM Version](https://img.shields.io/npm/v/ngrx-requests.svg?branch=master)](https://www.npmjs.com/package/ngrx-requests)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![install size](https://badgen.net/packagephobia/install/ngrx-requests?CB=2.0.1)](https://packagephobia.now.sh/result?p=ngrx-requests)
[![codecov](https://codecov.io/gh/akmjenkins/ngrx-requests/branch/master/graph/badge.svg)](https://codecov.io/gh/akmjenkins/ngrx-requests)
[![Build Status](https://travis-ci.org/akmjenkins/ngrx-requests.svg?branch=master)](https://travis-ci.org/akmjenkins/ngrx-requests)


`ngrx-requests` is a super simplified, user-friendly version of [ngrx-query](https://github.com/isaacplmann/ngrx-query) - the angular/ngrx version of [redux-query](https://github.com/amplitude/redux-query)

`ngrx-requests` primary goal is to **unopinionatedly** destroy all the boilerplate that surrounds network-related redux state, namely the success, fail, error and data state entries, actions and reducer-related code.

By **unopinionated**, we mean users should be able to adopt `ngrx-requests` pattern into their app a little at a time in a very user-friendly manner.

## Stop the Boilerplate

Listening for request status - in progress, error, success - is something that's often encountered across redux apps. Does your store look like this?

```js
feature: {
  isFetching:true,
  fetchError:{...}
  fetchSuccess:false,
  data:null
},
feature2: {
  isFetching:false,
  fetchError:null
  fetchSuccess:true,
  data:{...}
},
...
feature987: {
  isFetching:false,
  fetchError:null
  fetchSuccess:null,
  data:null
}
```

Maybe your effects look like this?

```js
Effect 1:
@Effect() myEffect$ = this.actions$
  pipe(
    ofType(GET_SOME_DATA),
    switchMap(() => this.service.doAsync()),
    map(() => [new feature.SuccessAction()]),
    catch((err,caught) => caught.pipe.startWith(new feature.FailAction(err)))
  )

Effect 2:
@Effect() myEffect$ = this.actions$
  pipe(
    ofType(GET_SOME_DATA_2),
    switchMap(() => this.service2.doAsync()),
    map(() => [new feature2.SuccessAction()]),
    catch((err,caught) => caught.pipe.startWith(new feature2.FailAction(err)))
  )

...

Effect 987:
@Effect() myEffect$ = this.actions$
  pipe(
    ofType(GET_SOME_DATA_987),
    switchMap(() => this.service987.doAsync()),
    map(() => [new feature987.SuccessAction()]),
    catch((err,caught) => caught.pipe.startWith(new feature987.FailAction(err)))
  )
```

You should be letting the simple fact that you're making a request handle all this boiler plate for you.

`ngrx-requests` uses an HttpInterceptor as a means to "listen in" on any request that you can match (and it provides some handy helper matchers, too!). When you register a listener, you'll be provided with Observables that give you that status of your request (IDLE, WORKING, SUCCESS, ERROR) and the request response. All of a sudden, your services can become the providers of all your data again, not your effects and not even the store, and all the boilerplate loading/success/error actions and repetitive cases in your reducers just disappear.

All you have to do, is make the request! No more dispatching success/fail actions, no more effects, no more selectors, no more boilerplate: just simply make the request.

Example:

```js
import { matchWithUrl } from 'ngrx-requests';

@Injectable()
export class MyService implements OnDestroy {

  private static PATH = 'https://restcountries.eu/rest/v2/name/';

  public status$: Observable<NgrxRequestStatus>;
  public meta$: Observable<any>;
  public request$: Observable<any>;
  private dispose: () => void;

  constructor(
    public requests: NgrxRequestService,
    public http: HttpClient
  ) {
    ({
      status$: this.status$,
      meta$: this.meta$,
      dispose: this.dispose
    } = this.requests.register(matchWithUrl(MyService.PATH)));
  }

  makeRequest(v: string) {
    this.request$ = this.http.get(`${MyService.PATH}${v}`).pipe(share());
  }

  ngOnDestroy() {
    this.dispose();
  }
}
```

Your component
```js
@Component({
  ...
})
export class MyComponent {

  public NGRXSTATUS = NgrxRequestStatus;

  constructor(
    public myService: MyService
  ) { }

  stringify(o: any = {}) {
    return JSON.stringify(o, undefined, 2);
  }

}
```

Template:
```html
<!-- subscribe to the request -->
<ng-container *ngIf="service.request$ | async"></ng-container>

<ng-container [ngSwitch]="service.status$ | async">
  <p *ngSwitchCase="NGRXSTATUS.IDLE">Not doing anything</p>
  <p *ngSwitchCase="NGRXSTATUS.WORKING">Loading data...</p>
  <p *ngSwitchCase="NGRXSTATUS.ERROR">Failed</p>
  <p *ngSwitchCase="NGRXSTATUS.SUCCESS">Success!</p>
</ng-container>

<pre *ngIf="[NGRXSTATUS.ERROR,NGRXSTATUS.SUCCESS].includes(service.status$ | async)">
  <ng-container *ngIf="(service.status$ | async) === NGRXSTATUS.SUCCESS">{{stringify((service.meta$ | async)?.body)}}</ng-container>
  <ng-container *ngIf="(service.status$ | async) === NGRXSTATUS.ERROR">{{stringify((service.meta$ | async))}}</ng-container>
</pre>
```

#### (slightly more) Advanced:

You might not feel comfortable (I wouldn't blame you) to leave all of your data inside your `NGRX_REQUESTS` slice of state in your store. Use an effect and it now becomes trivial to put your network-retrieved data wherever you want:

Add the request id to your service:
```js
export class MyService {
  public ngrxRequestId: string;
  ...

  constructor(
    requests: ngrxRequests,
    http: HttpService
  ) {
    ({
      id:this.ngrxRequestId
      ...
    } = this.requests.register(matchWithUrl(MyService.PATH)))
  }
}
```

Have your effect listen for `NgrxRequestAction.SUCCESS`:

```js
export class MyEffect {

  constructor (
    private actions$: Actions,
    private service: MyService
  ) {}

  @Effect() myEffect$ = this.actions$
    .pipe(
      ofType(NgrxRequestAction.SUCCESS),
      filter((action: NgrxRequestSuccess) => action.id === service.ngrxRequestId),
      map(({meta:HttpResponse<any>}) => new YourAction(meta.body))
    );  

}
```

## Be unopinionated

This should be evident from the examples above. `ngrx-requests` doesn't need you to create reducers, selectors, structure your store in a specific way, or require complex configuration, all you have to do to start using it. 

#### Import it:
```js
@NgModule({
  imports:[
    NgrxRequests,
    ...
  ]
})
```

#### Start listening in on requests:
```js
@Injectable()
export class MyService implments OnDestroy {
  constructor(
    requests: ngrxRequests
  ) {
    this.dispose = this.requests.register(matchWithUrl('/my-api')).dispose;
  }

  ngOnDestroy() {
    this.dispose();
  }
}
```

API
--

`ngrx-requests` is built with extreme simplicity, and thus flexibility, in mind. Here's what you need to know:

### ngrxRequestsService

#### `register(matcher: Matcher, transform?: Transformer): RequestData`

`matcher` - a function that accepts an HttpRequest and returns a boolean
`transform` - optional - a function that can transform the success or error response from the async request.

If no `transform` is provided, NgrxRequests uses it's default transformer which will update the status to `NgrxRequestStatus.Success` if an `HttpResponse` is received or `NgrxRequestStatus.ERROR` if an `HttpErrorResponse` is received.

If provided, `NgrxRequests` will dispatch an `NgrxRequestStatus.Success` action with any data that is returned from `transform` of an `NgrxRequestStatus.Error` action if an error is thrown.
Here's what the default `transform` looks like to give you an idea:

```js
const DEFAULT_TRANSFORM = (r: HttpResponse<any>) => {
  if (r instanceof HttpErrorResponse) {
    throw r;
  }
  return r;
};
```

This is what it returns:

```js
interface RequestData {
  id: string;
  request$: Observable<NgrxRequestStatusObject>;
  meta$: Observable<any>;
  status$: Observable<RequestStatus>;
  isIdle$: Observable<boolean>;
  isCanceled$: Observable<boolean>;
  isError$: Observable<boolean>;
  isSuccess$: Observable<boolean>;
  isWorking$: Observable<boolean>;on a request or group of requests
  dispose: () => void;
}
```

`id` - useful when in allowing you to listen to ngrx-request actions in your effects and dispatch your own actions.

`dispose` - useful when you want to stop the (very little overhead) of having ngrx-requests listen to a request. When a service is destroyed, for instance, you'll probably want to call `dispose()` in `ngOnDestroy`.

The rest of the Observables are simply selectors to the `NGRX_REQUESTS` slice of state for any request that the matcher you provided matches.

### Matchers

`ngrx-requests` helps you out by providing you `HttpRequest` matchers to help get you started:

##### `matchWithBody<T>(body:T)`
matches any request where the body of the request matches the provided body with equality i.e. `===`.

```js
// this
matchWithBody<string>('mybody')
// will match
http.post('/some-endpoint','mybody');
```
 
##### `matchWithBodyMatcher<T>(fn: (body: T) => boolean))` 
matches any request where the provided function that accepts the HttpRequest body returns true.

```js
// this 
 matchWithBodyMatcher((body: any) => body.params.key === 'value')));`
// will match
http.post('/some-endpoint',{params:{key:'value'}});
```
 

##### `matchWithHeader(name: string, val?: string)`
matches any request where a header exists with the provided name and, if the optional `val` is provided, the header matches it.

```js
// this
matchWithHeader('Authorization')});
// will match
http.get('/some-endpoint',{headers:{Authorization:'anything'}});

// and this
matchWithHeader('Authorization','Bearer 12345')})
// will match
http.post('/some-endpoint','data',{headers:{Authorization:'Bearer 12345'}});
```

##### `matchWithMethod(method: string)`
matches any request where the method matches the provided method (case insensitive)
```js
// this
matchWithMethod('post')
// will match
http.post('/some-endpoint');
```

##### `matchWithUrl(url: string | RegExp)`
matches any request whose `url` matches the provided string or regular expression

```js
// these 
matchWithUrl('someurl'));
matchWithUrl(/som[aeiou]url/)

// will match
httpService.get('/someurl');
// but not
httpService.get('/somurl');
```

##### `matchWithParam(name: string, val?: string)`
matches any request where a param exists with the provided name and, if the optional `val` is provided, the param matches it.

```js
// this
matchWithParam('query')});
// will match
http.get('/some-endpoint',{params:new HttpParams().append('query','value')});

// and this
matchWithParam('country','canada')});
// will match
http.get('/some-endpoint',{params:new HttpParams().append('country','canada')});
```


And finally, the ultimate combinator helpers to make everything super-readable:

##### `matchAll(...matchers: Matcher[])`:

Creates a matcher that returns true when all matchers passed in matches.

```js
// this
matchAll(
  matchWithParam('param1'),
  matchWithParam('param2', 'val2'),
  matchWithMethod('GET')
)  
// will match
  const params = new HttpParams().append('param1','any').append('param2','val2');
  httpService.get('/someurl',{params});
```

##### `matchAny(...matchers: Matcher[])`

Creates a matcher that returns true when any matcher passed in matches.

```js
// this
matchAny(
  matchWithParam('param3'),
  matchWithMethod('GET'),
  matchWithHeader('Authorization','Bearer 12345')
)

// will match any of these
httpService.get('/someurl');
httpService.get('/someOtherUrl',{params:new HttpParams().append('param3','val3')});
httpService.post(
  '/a-post',
  {
    params:new HttpParams().append('param','val3'),
    headers:{'Authorization':'Bearer 12345'}
  }
);
```

Finally, this is how you can use the matchers to help you:

```js
  this.ngrxRequestsService.register(matchWithUrl('/my-api'));
```

If you've got a more specific use case, you can always provide your own custom matcher:

```js
   this.ngrxRequestsService.register((req: HttpRequest<any>) => {
     if(...) {
       return true;
     }
     return false
   });
```


### Actions

`ngrx-requests` was inspired by [this great article](https://medium.com/@m3po22/stop-using-ngrx-effects-for-that-a6ccfe186399) about why (and how) you can stop fetching data inside your ngrx effects. But that doesn't mean you should stop doing everything inside your effects. In fact, you're encouraged to use your effects to "listen" for NGRX_REQUESTS actions and map your fetched data into the appropriate part of your store using `NgrxRequestAction.SUCCESS`

If you aren't using a `transform`, then each `NgrxRequestSuccess` action will have a `meta` property of the `HttpResponse`:

```js
  @Effect() myEffect$ = this.actions$
    .pipe(
      ofType(NgrxRequestAction.SUCCESS),
      filter((action: NgrxRequestSuccess) => action.id === service.ngrxRequestId),
      map(({meta:HttpResponse<any>}) => new YourAction(meta.body))
    ); 
``` 
