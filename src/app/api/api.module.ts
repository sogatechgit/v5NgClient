import { AttachmentPreviewComponent } from './cmp/attachment-preview/attachment-preview.component';

import { DataGridSplitComponent } from './cmp/data-grid/data-grid-split.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ApiCommonModule } from './cmp/api-common/api-common.module';
import { MaterialModule } from './../material.module';
import { AppInputAModule } from './cmp/app-input-a/app-input-a.module';

import { FileUploaderComponent } from './cmp/file-uploader/file-uploader.component';

import { DatePickerAComponent } from './cmp/date-picker-a/date-picker-a.component';
import { TreeViewComponent } from './cmp/tree-view/tree-view.component';

import { DataGridComponent } from './cmp/data-grid/data-grid.component';
import { DataGridBComponent } from './cmp/data-grid/data-grid-b.component';

import { DataGridBMgtComponent } from './cmp/data-grid/data-grid-bmgt.component';
import { RecordTypeSelectComponent } from './cmp/data-grid/record-type-select.component';
import { ReportViewerComponent } from './cmp/report-viewer/report-viewer.component';


import { DataGridColMgtComponent } from './cmp/data-grid/data-grid-col-mgt.component';
import { RiskMatrixComponent } from './cmp/risk-matrix/risk-matrix.component';
import { DataTabsComponent } from './cmp/data-tabs/data-tabs.component';
import { PanelAComponent } from './cmp/panel-a/panel-a.component';
import { PromptComponent } from './cmp/prompt/prompt.component';
import { AppFormAComponent } from './cmp/app-form-a/app-form-a.component';
import { AppFormBComponent } from './cmp/app-form-b/app-form-b.component';
import { WrapperAComponent } from './cmp/wrapper-a/wrapper-a.component';
import { FormHeaderComponent } from './cmp/form-header/form-header.component';
import { FilterParametersComponent } from './cmp/filter-parameters/filter-parameters.component';
import { FilterListComponent } from './cmp/filter-parameters/filter-list.component';

import { ProgressMaskComponent } from './cmp/progress-mask/progress-mask.component';
import { LoginComponent } from './cmp/login/login.component';


import { ToolbarComponent } from './cmp/toolbar/toolbar.component';
import { ToolbarButtonComponent } from './cmp/toolbar/toolbar-button.component';

import { AttachmentsComponent } from './../cmp/reference/attachments.component';
import { ReferenceDetailsComponent } from './../cmp/reference/reference-details.component';

import { ChartsComponent } from './cmp/charts/charts.component'

import { StatsDetailsComponent } from './cmp/stats-details/stats-details.component'
import { BarChartComponent } from './cmp/stats-details/Charts/bar-chart.component'
import { PieChartComponent } from './cmp/stats-details/Charts/pie-chart.component'
import { LineChartComponent } from './cmp/stats-details/Charts/line-chart.component'


const declare = [
  AppFormAComponent,
  AppFormBComponent,
  WrapperAComponent,
  PanelAComponent,
  PromptComponent,
  DataTabsComponent,
  RiskMatrixComponent,
  DatePickerAComponent,
  DataGridComponent,
  DataGridBComponent,
  DataGridBMgtComponent,
  DataGridSplitComponent,
  RecordTypeSelectComponent,
  TreeViewComponent,
  FormHeaderComponent,
  DataGridColMgtComponent,
  FilterParametersComponent,
  FilterListComponent,
  LoginComponent,
  ProgressMaskComponent,
  ToolbarComponent,
  ToolbarButtonComponent,
  ReportViewerComponent,

  AttachmentsComponent,
  ReferenceDetailsComponent,
  AttachmentPreviewComponent,

  FileUploaderComponent,
  ChartsComponent,
  StatsDetailsComponent,
  BarChartComponent,
  PieChartComponent,
  LineChartComponent
];

@NgModule({
  declarations: declare,
  exports: [declare, ApiCommonModule, AppInputAModule],
  imports: [CommonModule, ApiCommonModule, AppInputAModule, MaterialModule, ReactiveFormsModule],
})
export class APIModule {}
