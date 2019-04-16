import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NgrxRequestsModule } from 'projects/ngrx-requests';
import { HttpClientModule } from '@angular/common/http';
import { MyService } from './app.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    BrowserModule,
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument(),
    NgrxRequestsModule,
  ],
  providers: [MyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
