import { reducer, NgrxRequestStatus } from './reducer';
import { NgrxRequestStart, NgrxRequestAbort, NgrxRequestClear } from './actions';
import { errorActionWithId, successActionWithId } from './testing.utils';

describe('NgrxRequest Reducer', () => {

  test('it should return an object as default state', () => {
    const st = {};
    // @ts-ignore
    const nextState = reducer(st, {});

    expect(st).toBe(nextState);
  });

  test('should add a NgrxRequest to the state object', () => {
    const id = 'some id';
    const start = new NgrxRequestStart(id);
    const nextState = reducer({}, start);
    expect(nextState[id]).toBeTruthy();
  });

  test(`it should set the status of the NgrxRequest to be ${NgrxRequestStatus.WORKING} on NgrxRequestStart`, () => {
    const id = 'some id';
    const start = new NgrxRequestStart(id);
    const nextState = reducer({}, start);
    expect(nextState).toEqual(expect.objectContaining({[id]: {status: NgrxRequestStatus.WORKING}}));
  });

  test(`it should set the status of the NgrxRequest to be ${NgrxRequestStatus.SUCCESS} on NgrxRequestSuccess`, () => {
    const id = 'some id';
    const action = successActionWithId(id);
    const nextState = reducer({}, action);
    expect(nextState).toEqual(expect.objectContaining({[id]: {status: NgrxRequestStatus.SUCCESS}}));
  });

  test(`it should set the status of the NgrxRequest to be ${NgrxRequestStatus.ERROR} on NgrxRequestError`, () => {
    const id = 'some id';
    const action = errorActionWithId(id);
    const nextState = reducer({}, action);
    expect(nextState).toEqual(expect.objectContaining({[id]: {status: NgrxRequestStatus.ERROR}}));
  });

  test(`it should update the status of a NgrxRequest to ${NgrxRequestStatus.CANCELED} on NgrxRequestAbort`, () => {
    const id = 'some id';
    const start = new NgrxRequestAbort(id);
    const nextState = reducer({}, start);
    expect(nextState).toEqual(expect.objectContaining({[id]: {status: NgrxRequestStatus.CANCELED}}));
  });

  test('it should add meta to a NgrxRequest on success', () => {
    const id = 'some id';
    const meta = 'some meta';
    const nextState = reducer({}, successActionWithId(id, meta));
    expect(nextState[id]).toEqual(expect.objectContaining({meta}));
  });

  test('it should add meta to a NgrxRequest on error', () => {
    const id = 'some id';
    const meta = 'some meta';
    const nextState = reducer({}, errorActionWithId(id, meta));
    expect(nextState[id]).toEqual(expect.objectContaining({meta}));
  });

  test('it should remove a NgrxRequest on clear', () => {
    let state = {};
    const id = 'some id';
    state = reducer(state, successActionWithId(id));
    expect(state[id]).toBeTruthy();
    state = reducer(state, new NgrxRequestClear(id));
    expect(state[id]).toBeFalsy();
  });

  test('it should remove only the specified NgrxRequest on clear', () => {
    let state = {};
    const id = 'some id';
    const nextId = 'some other id';
    state = reducer(state, successActionWithId(id));
    state = reducer(state, successActionWithId(nextId));
    expect(state[id]).toBeTruthy();
    state = reducer(state, new NgrxRequestClear(id));
    expect(state[id]).toBeFalsy();
    expect(state[nextId]).toBeTruthy();
  });

  test('success/error/start actions should not affect other ids', () => {
    let state = {};
    const id = 'some id';
    const nextId = 'some other id';
    state = reducer(state, successActionWithId(id));
    expect(state[id]).toEqual(expect.objectContaining({status: NgrxRequestStatus.SUCCESS}));
    state = reducer(state, errorActionWithId(nextId));
    expect(state[id]).toEqual(expect.objectContaining({status: NgrxRequestStatus.SUCCESS}));
  });

});
