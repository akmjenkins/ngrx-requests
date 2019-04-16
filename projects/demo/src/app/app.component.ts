import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { NgrxRequestStatus } from 'projects/ngrx-requests';
import { MyService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  control = new FormControl('');
  title = 'demo';
  public NGRXSTATUS = NgrxRequestStatus;

  constructor(
    public service: MyService
  ) {
  }

  ngOnInit() {
    this
      .control
      .valueChanges
      .pipe(
        map((v: string) => this.service.makeRequest(v)),
        catchError((err, caught) => caught)
      ).subscribe(() => {});

  }

  stringify(o: any = {}) {
    return JSON.stringify(o, undefined, 2);
  }
}
