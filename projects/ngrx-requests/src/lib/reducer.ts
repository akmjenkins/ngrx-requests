import { Action, NgrxRequestAction } from './actions';

export const FEATURE = 'NGRX_REQUESTS';

export interface State {
  [key: string]: NgrxRequest;
}

const initialState = {};

export enum NgrxRequestStatus {
  IDLE = 'IDLE',
  CANCELED = 'CANCELED',
  WORKING = 'WORKING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export type NgrxRequestMeta = any;

export interface NgrxRequest {
  status: NgrxRequestStatus;
  meta?: NgrxRequestMeta;
}

const setStatus = (state: State, action: Action, status: NgrxRequestStatus, meta?: any): State => ({
  ...state,
  [action.id]: meta ? {meta, status} : {status}
});

export function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {

    case NgrxRequestAction.START:
      return setStatus(state, action, NgrxRequestStatus.WORKING);

    case NgrxRequestAction.ABORT:
    return setStatus(state, action, NgrxRequestStatus.CANCELED);

    case NgrxRequestAction.SUCCESS:
    return setStatus(state, action, NgrxRequestStatus.SUCCESS, action.meta);

    case NgrxRequestAction.ERROR:
    return setStatus(state, action, NgrxRequestStatus.ERROR, action.meta);

    case NgrxRequestAction.CLEAR:
      const { [action.id]: _, ...rest } = state;
      return rest;

    default:
      return state;
  }
}
