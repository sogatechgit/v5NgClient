import { AppDataset } from './../../svc/app-dataset.service';
import { FilterDataType } from './../../api/mod/app-common.classes';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { CoreModule } from './../core.module';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModuleCommon } from '../module.common';
import { Console } from 'node:console';

@Component({
  selector: 'app-anomalies',
  templateUrl: './anomalies.component.html',
  styleUrls: ['./anomalies.component.scss', './../module.common.scss'],
})
export class AnomaliesComponent extends ModuleCommon {
  private dlg: MatDialog;
  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);
  }

  // ngOnInit(): void {}
  AnomRowClick(args: any) {
    //console.log("####----AnomRowClick: ",args)


  }

  modOnInit(): void {
    console.log('Initmodule!');
    this.TableCode = 'an';
    // const initLookupParams: Array<any> = [{ filterValue: 147 }];

    // this.DataSet.SetLookupData(
    //   [
    //     { filterValue: 147 }, // Anomaly risk ranking Livelihood
    //     { filterValue: 148 }, // Anomaly risk ranking Severity
    //     { tableCode: 'mtx' }, // Anomaly Risk Matrix data
    //   ],
    //   (data) => {
    //     const riskColumn = this.grid.options.columns.find(
    //       (c) => c.fieldKey == 'RISK'
    //     );
    //     this.DataSet.cl([
    //       'SetLookupData Data ...',
    //       data,
    //       ', this.DataSet.riskMatrixData: ',
    //       this.DataSet.riskMatrixData,
    //       ' this.moduleExchangeInfo: ',
    //       this.moduleExchangeInfo,
    //       ', RefreshClick:',
    //       this.moduleExchangeInfo.gridObject.RefreshClick,
    //     ]);
    //   }
    // );
  }

  modAfterViewInit() {
    const ds: AppDataset = this.DataSet;

    // initialize lookups
    const riskColumn = this.grid.options.columns.find(
      (c) => c.fieldKey == 'RISK'
    );
    if (riskColumn) {
      ds.SetLookupData(
        [
          { filterValue: 147 }, // Anomaly risk ranking Livelihood
          { filterValue: 148 }, // Anomaly risk ranking Severity
          { tableCode: 'mtx' }, // Anomaly Risk Matrix data
        ],
        (data) => {
          const mtx = ds.riskMatrixData.mtx;
          riskColumn.lookupParams.lookupSource = mtx;
          riskColumn.matrixData = ds.riskMatrixData;
          /**
           * from ...
           * {
           *  key1:{code:string, fore:string, back:string},
           *  key2:{code:string, fore:string, back:string},
           *  key#:{code:string, fore:string, back:string}
           * }
           * to ...
           * {
           *  foreGround: { code1: fore1, code2: fore2, code#: fore# },
           *  backGround: { code1: back1, code2: back2, code#: back# }
           * }
           */
          let fore: any = {};
          let back: any = {};
          for (let key in mtx) {
            const item = mtx[key];
            fore[item.code] = item.fore;
            back[item.code] = item.back;
          }
          riskColumn.colorParams = { foreGround: fore, backGround: back };
        }
      );
    }
  }

  RowClick(e: any) {
    // console.log("\nGrid row clicked: ",e, ", this.moduleExchangeInfo: ", this.moduleExchangeInfo)
    const { data, sender, sample } = e;
    ///const data = e.data;
    //const sender = e.sender;
    // console.log("RowId's: ", e ,this.grid.rowIds)

  }

  SetupGrid() {
    console.log('SetupGrid!');
    // return;
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

    this.grid.options.AddColumn(
      {
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
        width: 40,
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
      },
      false,
      25
    );
  }

  DataExtracted(args: any) {
    // deconstruct arguments to assign individual propery to
    // corresponding local variables
    const { data, sender } = args;

    // to access id's ...
    const rowIds = sender.rowIds;

    // to access data components
    const { raw, processed, config } = data;
  }
}
