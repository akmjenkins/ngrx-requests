import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, share } from 'rxjs/operators';
import { NgrxRequestService, matchWithUrl, NgrxRequestData } from 'projects/ngrx-requests';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  control = new FormControl('');
  title = 'demo';

  req: NgrxRequestData;

  constructor(
    private http: HttpClient,
    private request: NgrxRequestService
  ) {
    this.req = this.request.register({matcher: matchWithUrl('restcountries')});
  }

  ngOnInit() {
    this
      .control
      .valueChanges
      .pipe(
        switchMap(v => this.http.get(`https://restcountries.eu/rest/v2/name/${v}`)),
        catchError((e, caught) => caught),
        share()
      )
      .subscribe(() => {});

  }

  stringify(o: any = {}) {
    return JSON.stringify(o, undefined, 2);
  }
}
