import { Action } from '@ngrx/store';

export enum NgrxRequestAction {
  START = '[REQUEST] Start',
  ABORT = '[REQUEST] Cancel',
  SUCCESS = '[REQUEST] Success',
  ERROR = '[REQUEST] Error',
  CLEAR = '[REQUEST] Clear'
}

export class NgrxRequestStart implements Action {
  public readonly type = NgrxRequestAction.START;
  constructor(public id: string) { }
}

export class NgrxRequestAbort implements Action {
  public readonly type = NgrxRequestAction.ABORT;
  constructor(public id: string) { }
}

export class NgrxRequestSuccess implements Action {
  public readonly type = NgrxRequestAction.SUCCESS;
  public id: string;
  constructor(public meta?: any) { }
}

export class NgrxRequestError implements Action {
  public readonly type = NgrxRequestAction.ERROR;
  public id: string;
  constructor(public meta?: any) { }
}

export class NgrxRequestClear implements Action {
  public readonly type = NgrxRequestAction.CLEAR;
  constructor(public id: string) { }
}

export type Action =
  NgrxRequestStart |
  NgrxRequestAbort |
  NgrxRequestSuccess |
  NgrxRequestError |
  NgrxRequestClear;
