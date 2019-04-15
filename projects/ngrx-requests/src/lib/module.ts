import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { FEATURE, reducer } from './reducer';
import { NgrxRequestService } from './service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgrxRequestInterceptor } from './interceptor';

@NgModule({
declarations: [],
  imports: [ StoreModule.forFeature(FEATURE, reducer) ],
  providers: [
    NgrxRequestService,
    { provide: HTTP_INTERCEPTORS, useClass: NgrxRequestInterceptor, multi: true }
  ]
})
export class NgrxRequestsModule {
}
