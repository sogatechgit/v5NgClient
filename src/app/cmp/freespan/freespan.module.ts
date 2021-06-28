import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIModule } from './../../api/api.module';

import { ReactiveFormsModule } from '@angular/forms';


import { FreespanComponent } from './freespan.component';
import { SpanBarComponent } from './span-bar.component';
import { SpanMarkComponent } from './span-mark.component';
import { SpanPipeComponent } from './span-pipe.component';
import { SurveySelectComponent } from './survey-select.component';

const declare = [FreespanComponent, SpanBarComponent, SpanMarkComponent, SpanPipeComponent, SurveySelectComponent];

@NgModule({
  declarations: declare,
  exports: declare,
  imports: [CommonModule, APIModule, ReactiveFormsModule],
})
export class FreespanModule { }


/*


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIModule } from './../../api/api.module';

import { AnomaliesComponent } from './anomalies.component';
import { AnomaliesDetailsComponent } from './anomalies-details.component';
import { AnomActionItemsComponent } from './anom-action-items/anom-action-items.component';
import { AnomActionItemsDetailsComponent } from './anom-action-items/anom-action-items-details.component';


const declare = [
  AnomaliesComponent,
  AnomaliesDetailsComponent,
  AnomActionItemsComponent,
  AnomActionItemsDetailsComponent,
];

@NgModule({
  declarations: declare,
  imports: [CommonModule, APIModule],
  exports: declare,
})
export class AnomaliesModule { }



*/