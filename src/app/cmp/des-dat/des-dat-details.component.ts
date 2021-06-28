import { Component, KeyValueDiffers, ViewChild } from '@angular/core';
import { AppDataset } from './../../svc/app-dataset.service';
import { DetailsCommon } from './../../cmp/details.common';
import { DataGridBComponent } from './../../api/cmp/data-grid/data-grid-b.component';

@Component({
  selector: 'app-des-dat-details',
  templateUrl: './des-dat-details.component.html',
  styleUrls: ['./des-dat-details.component.scss']
})
export class DesDatDetailsComponent  extends DetailsCommon {
  @ViewChild('rfGrid') rfGrid: DataGridBComponent;
  constructor(public differs: KeyValueDiffers) {
    super(differs);

    // this section will allow customized parameter settings for the details popup
    this.popHeight = 270;
    this.tabHeight = 200; // adjust popup height
    // this.popButtons= []
    this.titleEdit = 'Edit Record!';
    this.titleNew = 'New Record';

    // set view configurations
  }

  modOnInit() {}

  modAfterViewInit() {
    //console.log("\nDataset Matrix data: ", this.DataSet.riskMatrixData)
  }

  AssignEvents() {}

  ResetState() {}

  BeforeDataPosting(e: any) {
    
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


  ManageGridDesDatRF(args: any): void {
    args.abort = true;
    this.osb(
      'Sorry. Linked file management is not yet available...',
      'x',
      3000
    );
  }

  GetParentKeyVal() {
    return this.data ? this.data.moduleExchangeInfo.state.dataKeyValue : this.moduleExchangeInfo.state.dataKeyValue;
  }

  // Properties
  get dataManageRF(): any {
    return {
      top: {
        templateGrid: this.rfGrid,
        noLinkFilter: true,
        parentKeyValue: null,
        rights: { allowSelect: true, allowAdd:true },
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


}
