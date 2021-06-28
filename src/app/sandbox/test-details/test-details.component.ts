import { Component, KeyValueDiffers } from '@angular/core';
import { AppDataset } from './../../svc/app-dataset.service';
import { DetailsCommon } from './../../cmp/details.common';

@Component({
  selector: 'app-test-details',
  templateUrl: './test-details.component.html',
  styleUrls: ['./test-details.component.scss'],
})
export class TestDetailsComponent extends DetailsCommon {
  constructor(public differs: KeyValueDiffers) {
    super(differs);

    // this section will allow customized parameter settings for the details popup
    this.popHeight = 441;
    this.tabHeight = 270;
    // this.popButtons= []
    this.titleEdit = 'Edit Anomaly';
    this.titleNew = 'New Anomaly';

    // set view configurations
  }

  modOnInit() {}

  modAfterViewInit() {
    //console.log("\nDataset Matrix data: ", this.DataSet.riskMatrixData)
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
      const row = e.raw.an.row;
      const ds: AppDataset = this.form.DataSet;

      // initialize archive post data
      const ana = {
        data: {},
        stamps: {},
        table: ds.tables.ana,
        row: null,
        form: null,
      };
      const data = ana.data;
      const stamps = ana.stamps;
      const tana = ana.table;

      // iterate through archive columns and include in data all fields that
      // are defined in anomaly's row
      tana.columns.forEach((c) => {
        if (row[c.name] != undefined) {
          data[c.name] = row[c.name];
        }
      });

      // set arcive stamp fields
      stamps[tana.keyName] = -1;
      stamps['ANA_ARCHIVE_DATE'] = ds.dateStampString;
      stamps['ANA_ARCHIVE_BY'] = ds.userInfo.id;
      stamps['ANA_ARCHIVE_REASON'] = 'update';

      // include anomaly archive data to the composite post object
      e.raw.ana = ana;
    }

    // console.log("Before ")

    //
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
    return;
  }

  public get toggleDisplay(): Array<any> {
    //return this.DataSet.toggleYesNoNA;
    return [
      { value: 1, display: 'Yes' },
      { value: 0, display: 'No' },
      { value: null, display: '-' },
    ];
  }

  get matrixData(): any {
    // console.log("\nthis.DataSet: ", this.DataSet, ", this.form: ", this.form, ", this.form: ", this.form.DataSet)
    // return null;
    if (!this.DataSet) {
      console.log('\nmatrixData no dataset!');
      return null;
    }
    return this.DataSet.riskMatrixData;
  }

  // ChangeAsset(e:any){
  //   console.log("\nChange Asset:",e);
  // }
}
