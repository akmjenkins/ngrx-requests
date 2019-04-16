import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { share } from 'rxjs/operators';
import { NgrxRequestStatus, matchWithUrl, NgrxRequestService } from 'projects/ngrx-requests';
import { Observable } from 'rxjs';

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
    } = this.requests.register({matcher: matchWithUrl(MyService.PATH)}));
  }

  makeRequest(v: string) {
    this.request$ = this.http.get(`${MyService.PATH}${v}`).pipe(share());
  }

  ngOnDestroy() {
    this.dispose();
  }
}
