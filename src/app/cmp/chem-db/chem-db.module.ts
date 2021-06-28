import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIModule } from './../../api/api.module';

import { ChemDbComponent } from './chem-db.component';
import { ChemMainTabsDetailsComponent } from './chem-main-tabs-details/chem-main-tabs-details.component';

const declare = [
    ChemDbComponent,
    ChemMainTabsDetailsComponent
];

@NgModule({
  declarations: declare,
  imports: [CommonModule, APIModule],
  exports: declare,
})
export class ChemDbModule {}
