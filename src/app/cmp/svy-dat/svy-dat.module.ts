import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIModule } from './../../api/api.module';

import { SvyDatComponent } from './svy-dat.component';
import { SvyDatDetailsComponent } from './svy-dat-details.component';
import { SvyDatCampEvtSelectorComponent } from './svy-dat-camp-evt-selector.component';
import { SvyDatCampComponent } from './svy-dat-camp.component';
import { SvyDatEvtComponent } from './svy-dat-evt.component';

const declare = [
    SvyDatComponent,
    SvyDatDetailsComponent,
    SvyDatCampEvtSelectorComponent,
    SvyDatCampComponent,
    SvyDatEvtComponent
];

@NgModule({
  declarations: declare,
  imports: [CommonModule, APIModule],
  exports: declare,
})
export class SvyDatModule {}
