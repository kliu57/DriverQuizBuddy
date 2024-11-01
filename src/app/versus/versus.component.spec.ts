import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersusComponent } from './versus.component';

describe('VersusComponent', () => {
  let component: VersusComponent;
  let fixture: ComponentFixture<VersusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VersusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VersusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
