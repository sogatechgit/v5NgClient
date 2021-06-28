import { FilterDataType } from './../../api/mod/app-common.classes';
// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-test-panel',
//   templateUrl: './test-panel.component.html',
//   styleUrls: ['./test-panel.component.scss']
// })
// export class TestPanelComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }

import { AppMainServiceService } from './../../svc/app-main-service.service';
import { TestDetailsComponent } from './../test-details/test-details.component';

import { ModuleCommon } from './../../cmp/module.common';
import { MatDialog } from '@angular/material/dialog';
import { Component, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-test-panel',
  templateUrl: './test-panel.component.html',
  styleUrls: ['./test-panel.component.scss'],
})
export class TestPanelComponent extends ModuleCommon {
  @ViewChild(TestDetailsComponent) testDetailsComponent: TestDetailsComponent;

  // @Input() DataSet: AppDataset;

  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);
  }

  modOnInit(): void {
    this.DataSet.SetLookupData(
      [
        { filterValue: 147 }, // Anomaly risk ranking Livelihood
        { filterValue: 148 }, // Anomaly risk ranking Severity
        { tableCode: 'mtx' }, // Anomaly Risk Matrix data
      ],
      (data) => {
        // console.log("SetLookupData Data ...",data,", this.DataSet.riskMatrixData: ",this.DataSet.riskMatrixData)
      }
    );
  }

  modAfterViewInit() {}

  RowClick(e: any) {}

  SetupGrid() {
    /*****************************************************************************
     Add columns and link definitions in this section to which will be appended
     to the automatically defined columns/links using the gridColumns definition

    ==========
     Example:
    ==========
    this.grid.options
    .AddColumn({
      caption: 'Title',
      fieldName: 'AN_TITLE',
      minWidth: 275,
    })
    .AddColumn({
      caption: 'Raised By',
      fieldName: 'AN_RAISED_BY',
      width: 100,
    })
    *****************************************************************************/

    // this.grid.options
    //   .AddColumn({
    //     caption: 'Group',
    //     fieldName: 'ANTYPE_GROUP',
    //     width: 75,
    //     align: 'center',
    //     displayField:'ANT_GRP'
    //   },true)

    this.grid.options.AddColumn({
      fieldAlias: 'RISK',

      // matrix type filter, matrixData is supplied with
      // null value at this point, but will be assigned
      // the correct value onSuccess method of the
      // lookup extraction in ngOnInit lifecycle

      filterType: FilterDataType.MATRIX,
      matrixData: null,

      matrixSeverity: 'AN_RISK_RANK_SEVERITY',
      matrixLikelihood: 'AN_RISK_RANK_LIKELIHOOD',

      value: 'M{AN_RISK_RANK_SEVERITY}{AN_RISK_RANK_LIKELIHOOD}',
      width: 100,
      align: 'center',
      caption: 'Risk',
      colorParams: null,
      lookupParams: {
        lookupSource: null, // this will later be replaced with this.ds.riskMatrixData.mtx onSuccess of lookup retreival
        lookupDisplayField: 'code',
        lookupValueField: 'object',
      },
      displayFormat: '',
      requiredFields: ['AN_RISK_RANK_SEVERITY', 'AN_RISK_RANK_LIKELIHOOD'],
    });
  }
}
