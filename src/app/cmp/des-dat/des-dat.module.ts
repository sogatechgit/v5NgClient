import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIModule } from './../../api/api.module';

import { DesDatComponent } from './des-dat.component';
import { DesDatDetailsComponent } from './des-dat-details.component';
import { DesDatKpComponent } from './des-dat-kp/des-dat-kp.component';
import { DesDatKpDetailsComponent } from './des-dat-kp/des-dat-kp-details.component';

const declare = [
  DesDatComponent, 
  DesDatDetailsComponent,
  DesDatKpComponent,
  DesDatKpDetailsComponent
];

@NgModule({
  declarations: declare,
  imports: [CommonModule, APIModule],
  exports: declare,
})
export class DesDatModule {}
