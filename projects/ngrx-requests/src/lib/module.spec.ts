import { TestBed, async } from '@angular/core/testing';
import { NgrxRequestInterceptor } from './interceptor';
import { NgrxRequestsModule } from './module';
import { StoreModule } from '@ngrx/store';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('Request Module', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ NgrxRequestsModule, StoreModule.forRoot({}) ]
    });
  }));

  test('it should provide the interceptor', () => {
    const interceptors = TestBed.get(HTTP_INTERCEPTORS);
    expect(interceptors.some((i: any) => i instanceof NgrxRequestInterceptor)).toBeTruthy();
  });

});
