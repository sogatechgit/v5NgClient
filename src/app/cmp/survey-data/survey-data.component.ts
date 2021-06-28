import { AppMainServiceService } from './../../svc/app-main-service.service';
import { FormCommon } from './../form.common';
import { Component, OnInit } from '@angular/core';
import { CellTextAlign } from 'src/app/api/cmp/data-grid/data-grid.component';

@Component({
  selector: 'app-survey-data',
  templateUrl: './survey-data.component.html',
  styleUrls: ['./survey-data.component.scss'],
})
export class SurveyDataComponent extends FormCommon implements OnInit {
  constructor(public dataSource: AppMainServiceService) {
    super(dataSource);
  }

  ngOnInit(): void {
    this.CommonFormInit();

    this.SetupGridColumns();

    return;
    //SVY_HDR_NOD_ID

    // Setup main tab configuration
    this.mainTabsOptions
      .AddTab({
        id: 1,
        label: 'General Information',
        icon: 'fa fa-info-circle',
        active: true,
      })
      .AddTab({
        id: 2,
        label: 'Position',
        active: true,
      })
      .AddTab({
        id: 3,
        label: 'Assessment',
        active: true,
      })
      .AddTab({
        id: 4,
        label: 'Failure Threats',
        active: true,
      })
      .AddTab({
        id: 5,
        label: 'Attachments',
        active: true,
      })
      .AddTab({
        id: 6,
        label: 'Related Survey Events',
        active: true,
      })
      .AddTab({
        id: 7,
        label: 'Related Anomalies',
        active: true,
      });
    //.AddTab({ id: 2, label: 'Linked Anomalies', icon: '', active: false });
  }

  /***************** NEEW CODES  ******************************** */
  SetupGridColumns() {
    const {
      center,
      minShort,
      minLong,
      minMemo,
      wd1,
      wd2,
      wd3,
      wd4,
      wd5,
      wd6,
    } = this.ds.constUISettings;

    const colorParams = {
      foreGround: { 8470: '#fff', 8471: '#000', 8472: '#fff' },
      backGround: { 8470: '#28a745', 8471: '#ffc107', 8472: '#dc3545' },
    };

    // Setup grid
    this.mainGridOptions
      // Data grid UI definition *****************************************
      .RowHeight(22)

      // Set key column name
      .SetKeyColumnName('SVY_HDR_ID')

      // add data grid columns *****************************************
      .AddColumn({
        fieldName: 'SVY_HDR_ID',
        width: wd2,
        caption: 'ID',
        align: center,
        isKey: true,
        allowFilter: false,
        // sortAsc: true,
        // filters:[1],
      })

      .AddColumn({
        fieldName: 'SVY_HDR_NOD_ID',
        width: wd3,
        caption: 'Asset',
        align: center,
      })

      // set mandatory field(s) needed to be extracted from the database
      // even if the grid column(s)'s visibility mode is set to hidden
      .AddRequiredDataFields(['SVY_HDR_ID', 'SVY_HDR_NOD_ID'])

      // show only selected fields to display
      .ShowColumns(['SVY_HDR_ID', 'SVY_HDR_NOD_ID']);
    // .HideColumns(['AN_ID'])

    // module-specific join statement *****************************************
    // .LeftJoin({
    //   code: 'node',
    //   alias: 'alkp',
    //   localField: 'AN_ASSET_ID',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'ocls',
    //   localField: 'AN_ORIG_CLASS',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'ccls',
    //   localField: 'AN_CURR_CLASS',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'oacls',
    //   localField: 'AN_ORIG_AVAIL_CLASS',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'cacls',
    //   localField: 'AN_CURR_AVAIL_CLASS',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'stat',
    //   localField: 'AN_STATUS',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'mareq',
    //   localField: 'AN_MAINT_REQ',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'sapstat',
    //   localField: 'AN_WO_STATUS',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'risksev',
    //   localField: 'AN_RISK_RANK_SEVERITY',
    // })
    // .LeftJoin({
    //   code: 'lkp',
    //   alias: 'risklik',
    //   localField: 'AN_RISK_RANK_LIKELIHOOD',
    // })
    // .AddFieldMap({ nickName: 'OC', fieldName: 'AN_ORIG_AVAIL_CLASS' })
    // .AddFieldMap({ nickName: 'L', fieldName: 'AN_RISK_RANK_LIKELIHOOD' })
    // .AddFieldMap({ nickName: 'S', fieldName: 'AN_RISK_RANK_SEVERITY' });
  }
}
