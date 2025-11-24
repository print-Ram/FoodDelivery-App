import { TestBed } from '@angular/core/testing';

import { LoadingButtonService } from './loading-button.service';

describe('LoadingButtonService', () => {
  let service: LoadingButtonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingButtonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
