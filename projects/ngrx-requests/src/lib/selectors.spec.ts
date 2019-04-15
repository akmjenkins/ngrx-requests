import { requestMeta, requestStatus, requests, request, isIdle, isCanceled, isError, isSuccess, isWorking } from './selectors';
import { NgrxRequestStatus } from './reducer';
import { async, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { NgrxRequestsModule } from './module';
import { NgrxRequestStart, NgrxRequestAbort, } from './actions';
import { successActionWithId, errorActionWithId } from './testing.utils';

// This is more of a "full module test" but it's the most effective
// way to test the selectors without imparting too many implementation
// details like the shape of the state

describe('NgrxRequest Selectors', () => {

  let store: Store<any>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        NgrxRequestsModule,
      ]
    });
    store = TestBed.get(Store);
  }));

  test('feature selector', done => {
    store.select(requests)
      .subscribe(r => expect(r).toEqual({}), done());
  });

  test('NgrxRequest selector without a NgrxRequest', done => {
    store.select(...request(''))
      .subscribe(d => expect(d).toBeFalsy(), done());
  });

  test('NgrxRequest selector with a NgrxRequest', done => {
    const identifier = 'id';
    store.dispatch(new NgrxRequestStart(identifier));
    store.select(...request(identifier))
      .subscribe(d => expect(d).toBeTruthy(), done());
  });

  test('meta', done => {
    const identifier = 'identifier';
    const meta = 'some meta';
    store.dispatch(successActionWithId(identifier, meta));
    store.select(...requestMeta(identifier))
      .subscribe(d => expect(d).toBe(meta), done());
  });

  test('status', done => {
    const identifier = 'identifier';
    store.dispatch(new NgrxRequestStart(identifier));
    store.select(...requestStatus(identifier))
      .subscribe(d => expect(d).toBe(NgrxRequestStatus.WORKING), done());
  });

  test('status when no NgrxRequest', done => {
    store.select(...requestStatus(''))
      .subscribe(d => expect(d).toBe(NgrxRequestStatus.IDLE), done());
  });

  test('idle without a NgrxRequest', done => {
    const identifier = 'identifier';
    store.select(...isIdle(''))
      .subscribe(d => expect(d).toBe(true), done());
  });

  test('idle with a NgrxRequest', done => {
    const identifier = 'identifier';
    store.dispatch(new NgrxRequestStart(identifier));
    store.select(...isIdle(identifier))
      .subscribe(d => expect(d).toBe(false), done());
  });

  test('canceled', done => {
    const identifier = 'identifier';
    store.dispatch(new NgrxRequestAbort(identifier));
    store.select(...isCanceled(identifier))
      .subscribe(d => expect(d).toBe(true), done());
  });

  test('error', done => {
    const identifier = 'identifier';
    store.dispatch(errorActionWithId(identifier));
    store.select(...isError(identifier))
      .subscribe(d => expect(d).toBe(true), done());
  });

  test('success', done => {
    const identifier = 'identifier';
    store.dispatch(successActionWithId(identifier));
    store.select(...isSuccess(identifier))
      .subscribe(d => expect(d).toBe(true), done());
  });

  test('working', done => {
    const identifier = 'identifier';
    store.dispatch(new NgrxRequestStart(identifier));
    store.select(...isWorking(identifier))
      .subscribe(d => expect(d).toBe(true), done());
  });

});
