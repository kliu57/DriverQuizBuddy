import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvoIlcComponent } from './tvo-ilc.component';

describe('TvoIlcComponent', () => {
  let component: TvoIlcComponent;
  let fixture: ComponentFixture<TvoIlcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TvoIlcComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TvoIlcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
