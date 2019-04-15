import {
  NgrxRequestError,
  NgrxRequestAbort,
  NgrxRequestStart,
  NgrxRequestClear,
  NgrxRequestAction,
  NgrxRequestSuccess
} from './actions';

describe('Request Actions', () => {

  test('Request Start', () => {
    const id = 'id';
    const action = new NgrxRequestStart(id);
    expect(action.type).toBe(NgrxRequestAction.START);
    expect(action.id).toBe(id);
  });

  test('Request Cancel', () => {
    const id = 'id';
    const action = new NgrxRequestAbort(id);
    expect(action.type).toBe(NgrxRequestAction.ABORT);
    expect(action.id).toBe(id);
  });

  test('Request Clear', () => {
    const id = 'id';
    const action = new NgrxRequestClear(id);
    expect(action.type).toBe(NgrxRequestAction.CLEAR);
    expect(action.id).toBe(id);
  });

  test('Request Success', () => {
    const id = 'id';
    const meta = 'meta';
    const action = new NgrxRequestSuccess(meta);
    action.id = id;
    expect(action.type).toBe(NgrxRequestAction.SUCCESS);
    expect(action.id).toBe(id);
    expect(action.meta).toBe(meta);
  });

  test('Request Error', () => {
    const id = 'id';
    const meta = 'meta';
    const action = new NgrxRequestError(meta);
    action.id = id;
    expect(action.type).toBe(NgrxRequestAction.ERROR);
    expect(action.id).toBe(id);
    expect(action.meta).toBe(meta);
  });

});
