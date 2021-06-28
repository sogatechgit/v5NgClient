import { FormGroup } from '@angular/forms';
import { DataGridBComponent } from './../../../api/cmp/data-grid/data-grid-b.component';
import { Component, KeyValueDiffers } from '@angular/core';
import { AppDataset } from './../../../svc/app-dataset.service';
import { DetailsCommon } from './../../../cmp/details.common';

@Component({
  selector: 'app-anom-action-items-details',
  templateUrl: './anom-action-items-details.component.html',
  styleUrls: ['./anom-action-items-details.component.scss'],
})
export class AnomActionItemsDetailsComponent extends DetailsCommon {
  constructor(public differs: KeyValueDiffers) {
    super(differs);

    // this section will allow customized parameter settings for the details popup
    this.popHeight = 310;
    this.popWidth = 820;
    // this.tabHeight = 270;
    // this.popButtons= []
    this.titleEdit = 'Edit Action Item';
    this.titleNew = 'New Action Item';

    // set view configurations
  }

  public LWD: number = 100;
  public LPL: number = 8;

  modOnInit() {}

  modAfterViewInit() {
    //console.log("\nDataset Matrix data: ", this.DataSet.riskMatrixData)
    console.log(
      '\n#### modAfterViewInit modules info this.moduleExchangeInfo : ',
      this.moduleExchangeInfo
    );
  }

  AssignEvents() {}

  ResetState() {}

  BeforeDataPosting(e: any) {
    // run module-specific pre-posting routine here. this required to create
    // additional information to be posted.

    // this test module is specific to Anomaly table which requires archive record be
    // created when a record is edited

    const mode = e.mode;
    // on edit mode, create archive record
    if (mode == 'edit') {
      // Create archive record
      // const row = e.raw.an.row;
      // const ds: AppDataset = this.form.DataSet;
    }
  }

  GetMEI(args: any): any {
    if (args.currentForm)
      if (args.currentForm.moduleExchangeInfo)
        if (args.currentForm.moduleExchangeInfo)
          return args.currentForm.moduleExchangeInfo;
    return null;
  }

  GetParentRow(args: any): any {
    const mei = this.GetMEI(args);
    if (mei)
      if (mei.gridObject)
        if (mei.gridObject.parentGrid)
          return mei.gridObject.parentGrid.grid.currentRow;
    return null;
  }

  GetCurrentRows(args: any): Array<any> {
    const mei = this.GetMEI(args);
    if (mei)
      if (mei.gridObject)
        if (mei.gridObject.grid)
          return mei.gridObject.grid.sourceRows
            ? mei.gridObject.grid.sourceRows
            : [];
    return [];
  }

  AfterFormCreate(e: any) {
    /**
     *
     * Event triggered after creating formObject
     *
     * const frm: FormGroup = e.form;
     * const frmCurr: FormGroup = e.currentForm.formObject;
     * const rowCurr: FormGroup = e.currentForm.formRow;
     */

    const access = e.sender.AccessMode;
    if (access == 'add') {
      const parentRow = this.GetParentRow(e);
      const meiCurr: FormGroup = e.currentForm.moduleExchangeInfo;
      const frm: FormGroup = e.sender.formObject;
      const row: any = e.sender.formRow;
      const rows = this.GetCurrentRows(e);
      // console.log(
      //   '\n#### AfterFormCreate this.moduleExchangeInfo.gridObject.parentGrid(parentRow): ',
      //   parentRow,
      //   frm,
      //   '\nAfterFormCreate args: ',
      //   e,
      //   '\nAccessmode: ',
      //   access,
      //   '\nRow: ',
      //   row,
      //   '\nRows: ',
      //   rows
      // );

      let newId:string = parentRow.AN_REF + '-01'
      if (rows.length) {
        const maxElem = this.DataSet.apiCommon.MaxElement(rows, 'AI_REF_NO');
        const idArr = maxElem.AI_REF_NO.split('-');
        newId= '0' + (+idArr[2] + 1);
        idArr[2] = newId.substr(newId.length - 2, 2);
        newId = idArr.join('-')
        //
      }
      console.log("\nnewId: ",newId);
      frm.get('AI_REF_NO').setValue(newId);
      frm.get('AI_AN_ID').setValue(parentRow.AN_ID);
    }
    //
  }
}
