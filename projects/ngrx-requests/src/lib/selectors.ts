import { createSelector, createFeatureSelector } from '@ngrx/store';
import { State, FEATURE, NgrxRequest, NgrxRequestStatus, NgrxRequestMeta } from './reducer';
import { SelectorWithProps } from '@ngrx/store/src/models';
import { MemoizedSelectorWithProps } from '@ngrx/store/src/selector';


interface Props { id: string; }
type RequestSelector<T> = SelectorWithProps<State, Props, T>;
type RequestProjector<T> = (req: NgrxRequest) => T;
type RequestCallback<T> = () => RequestSelector<T>;
type RequestSelectorHelper<T> = [ MemoizedSelectorWithProps<any, Props, T> , Props ];

export const requests = createFeatureSelector<any, State>(FEATURE);

// helpers to create paramterized selectors
// normally we'd do something like this:
// store.select(selector.request,{id:requestId})
//
// but instead we're making paramterized selectors so you can do this:
// const [selector,parameter] = selector.request(requestId);
// store.select(selector,parameter);
//
// and this is even better:
// store.select(...selector.request(IDENTIFIER)) OR store.select(...selector.isIdle(IDENTIFIER))

const selectorHelper = <T extends {}>(cb: RequestCallback<T>) =>
  (id: string): RequestSelectorHelper<T> => [createSelector(requests, cb()), {id}];

const getRequestStatus = (req?: NgrxRequest): NgrxRequestStatus => req ? req.status : NgrxRequestStatus.IDLE;
const isRequestOfStatus = (status: NgrxRequestStatus) => (req?: NgrxRequest): boolean => getRequestStatus(req) === status;

const projector = <T extends any>(cb?: RequestProjector<T>) => (): RequestSelector<T> => (st, {id}) => cb(st[id]);
const statusHelper = (status: NgrxRequestStatus) => selectorHelper(projector<boolean>(isRequestOfStatus(status)));

export const request = selectorHelper(projector<NgrxRequest>(req => req));
export const requestStatus = selectorHelper(projector<NgrxRequestStatus>(getRequestStatus));
export const requestMeta = selectorHelper(projector<NgrxRequestMeta>(req => req && req.meta));
export const isIdle = statusHelper(NgrxRequestStatus.IDLE);
export const isCanceled = statusHelper(NgrxRequestStatus.CANCELED);
export const isError = statusHelper(NgrxRequestStatus.ERROR);
export const isSuccess = statusHelper(NgrxRequestStatus.SUCCESS);
export const isWorking = statusHelper(NgrxRequestStatus.WORKING);
