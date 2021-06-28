import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIModule } from './../../api/api.module';

import { ComplianceComponent } from './compliance.component';
import { ComplianceDetailsComponent } from './compliance-details.component';

const declare = [
  ComplianceComponent, 
  ComplianceDetailsComponent
];

@NgModule({
  declarations: declare,
  imports: [CommonModule, APIModule],
  exports: declare,
})
export class ComplianceModule {}
