import { AppMainServiceService } from './../../svc/app-main-service.service';
import { DataGridBComponent } from './../../api/cmp/data-grid/data-grid-b.component';
import { Component, KeyValueDiffers, ViewChild } from '@angular/core';
import { AppDataset } from './../../svc/app-dataset.service';
import { DetailsCommon } from './../../cmp/details.common';

@Component({
  selector: 'app-anomalies-details',
  templateUrl: './anomalies-details.component.html',
  styleUrls: ['./anomalies-details.component.scss'],
})
export class AnomaliesDetailsComponent extends DetailsCommon {
  @ViewChild('ftGrid') ftGrid: DataGridBComponent;
  @ViewChild('anGrid') anGrid: DataGridBComponent;
  @ViewChild('rfGrid') rfGrid: DataGridBComponent;

  constructor(
    public differs: KeyValueDiffers,
    private appMainService: AppMainServiceService
  ) {
    super(differs);

    // this section will allow customized parameter settings for the details popup
    this.popHeight = 428;
    this.popWidth = 900;
    this.tabHeight = 270;
    // this.popButtons= []
    this.titleEdit = 'Edit Anomaly';
    this.titleNew = 'New Anomaly';

    // set view configurations
  }

  modOnInit() {}

  modAfterViewInit() {
    // setTimeout(()=>{
    //   console.log("\n@@@@@ Dataset Matrix data: ", this.DataSet.riskMatrixData)
    // },5000)
    
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

  ManageGridRF(args: any): void {
    args.abort = true;
    this.osb(
      'Sorry. Linked file management is not yet available...',
      'x',
      3000
    );
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

  FileClickAtt(event:any){
    console.log("Implementation! :", event)
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

  get dataManageFT(): any {
    return {
      top: {
        templateGrid: this.ftGrid,
        noLinkFilter: true,
        parentKeyValue: null,
        rights: { allowSelect: true },
        fontFactor: 0.85,
        noFooter: true,
        title: 'Available Failure Threats ({RECS})',
      },
      bottom: {
        templateGrid: this.ftGrid,
        fontFactor: 0.85,
        rights: { allowSelect: true },
        title: 'Related Failure Threats ({LINKED} linked, max={LIMIT})',
        maxItems: 50,
      },
    };
  }

  get dataManageAN(): any {
    return {
      top: {
        templateGrid: this.anGrid,
        noLinkFilter: true,
        parentKeyValue: null,
        rights: { allowSelect: true },
        fontFactor: 0.85,
        noFooter: false,
        title: 'Available Anomalies ({RECS})',
      },
      bottom: {
        templateGrid: this.anGrid,
        fontFactor: 0.85,
        rights: { allowSelect: true },
        title: 'Related Anomalies ({LINKED} linked, max={LIMIT})',
        noFooter: true,
        maxItems: 50,
      },
    };
  }

  get dataManageRF(): any {
    return {
      top: {
        templateGrid: this.rfGrid,
        noLinkFilter: true,
        parentKeyValue: null,
        rights: { allowSelect: true },
        fontFactor: 0.85,
        noFooter: false,
        title: 'Available Reference Files ({RECS})',
        addComponent:{
          component:null,
          data:null
        }
      },
      bottom: {
        templateGrid: this.rfGrid,
        fontFactor: 0.85,
        rights: { allowSelect: true },
        title: 'Attached Reference ({LINKED} linked, max={LIMIT})',
        noFooter: true,
        maxItems: 50,
      },
    };
  }
  // ChangeAsset(e:any){
  //   console.log("\nChange Asset:",e);
  // }
}
