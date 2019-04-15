/*
 * Public API Surface of ngrx-requests
 */
import * as actions from './lib/actions';
export { NgrxRequestAction } from './lib/actions';
export * from './lib/service';
export * from './lib/module';
export * from './lib/matchers';
export { NgrxRequestStatus, NgrxRequest } from './lib/reducer';

export type NgrxRequestSuccess = actions.NgrxRequestSuccess;
export type NgrxRequestError = actions.NgrxRequestError;
export type NgrxRequestAbort = actions.NgrxRequestAbort;
export type NgrxRequestStart = actions.NgrxRequestStart;
