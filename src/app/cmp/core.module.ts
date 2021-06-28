import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './../material.module';
import { APIModule } from './../api/api.module';


import { AssetManagementModule } from './asset-management/asset-management.module';
import { UserManagementModule } from './user-management/user-management.module';
import { SurveyUploadModule } from './survey-upload/survey-upload.module';
import { SurveyDataModule } from './survey-data/survey-data.module';
import { SettingsModule } from './settings/settings.module';
import { SeismicModule } from './seismic/seismic.module';
import { RiskBasedInspectionModule } from './risk-based-inspection/risk-based-inspection.module';
import { FreespanModule } from './freespan/freespan.module';

import { LocationSelectorComponent } from './location-selector/location-selector.component';
import { AppLandingComponent } from './app-landing/app-landing.component';

// associated with v2 implementation // import { ChemDbModule } from './chem-db/chem-db.module';
import { AnomaliesModule } from './anomalies/anomalies.module';
import { DesDatModule } from './des-dat/des-dat.module';
import { ChemDbModule } from './chem-db/chem-db.module';
import { SvyDatModule } from './svy-dat/svy-dat.module';

import { ComplianceModule } from './compliance/compliance.module';

import { ReferenceModule } from './reference/reference.module';


// will become obsolete when v2 is fully implemented

const declare = [
  AppLandingComponent,
  LocationSelectorComponent,
];
const both = [
  // common modules
  APIModule,
  MaterialModule,

  // Feature modules
  AnomaliesModule,
  DesDatModule,
  SvyDatModule,
  ComplianceModule,

  AssetManagementModule,
  ChemDbModule,
  ReferenceModule,
  FreespanModule,
  RiskBasedInspectionModule,
  SeismicModule,
  SettingsModule,
  SurveyDataModule,
  SurveyUploadModule,
  UserManagementModule,
];

@NgModule({
  declarations: declare,
  imports: [CommonModule, both],
  exports: [AppLandingComponent, both],
})
export class CoreModule {
  static injector: Injector;
  constructor(injector: Injector) {
    CoreModule.injector = injector;
  }
}
