import { Component, KeyValueDiffers, ViewChild } from '@angular/core';
import { AppDataset } from './../../svc/app-dataset.service';
import { DetailsCommon } from './../../cmp/details.common';
import { DataGridBComponent } from './../../api/cmp/data-grid/data-grid-b.component';

@Component({
  selector: 'app-compliance-details',
  templateUrl: './compliance-details.component.html',
  styleUrls: ['./compliance-details.component.scss']
})


export class ComplianceDetailsComponent extends DetailsCommon {
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




  modOnInit() { }

  modAfterViewInit() {
    //console.log("\nDataset Matrix data: ", this.DataSet.riskMatrixData)
  }

  AssignEvents() { }

  ResetState() { }

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



  public CA_TASK_TYPEChange(): void {
    this.form.formObject.get("CA_LAST_DATE").setValue(null);
    this.form.formObject.get("CA_TARGET_DATE").setValue(null);
    this.form.formObject.get("CA_NEXT_TARGET_DATE").setValue(null);
    this.form.formObject.get("CA_FREQ_JUST").setValue(null);
  }

  public CA_TASK_FREQ_Changed(): void {
    const taskType = this.form.formObject.get("CA_TASK_FREQ").value;
    var mo = 0;

    switch (+(taskType)) {
      case 17750: mo = 1; break;      //1 month
      case 17751: mo = 3; break;      //3 months
      case 17752: mo = 6; break;      //6 months
      case 17753: mo = 12; break;     //1 year
      case 17754: mo = 36; break;     //3 years
      case 17755: mo = 60; break;    //5 years
      case 17756: mo = 24; break;    //2 years
      default: mo = 0; break; //Once
    }

    const lastDate = new Date(this.form.formObject.get("CA_LAST_DATE").value);
    //lastDate.setMonth(lastDate.getMonth() + mo);

    const targetDate = lastDate.setMonth(lastDate.getMonth() + mo);
    this.form.formObject.get("CA_TARGET_DATE").setValue(targetDate);

    const nextTargetDate = lastDate.setMonth(lastDate.getMonth() + mo);
    this.form.formObject.get("CA_NEXT_TARGET_DATE").setValue(nextTargetDate);

  }

  public get isTaskTypeCM(): boolean {
    if (this.form) {
      const taskType = this.form.formObject.get("CA_TASK_TYPE").value;

      if (taskType == 17731) {//If CM, disable Task Frequency and Dates.
        //this.form.formObject.get("CA_TARGET_DATE").setValue(null);
        //this.form.formObject.get("CA_TARGET_DATE").setValue(null);
        return true;
      } else
        return false;
    }

    return true;
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
        rights: { allowSelect: true, allowAdd: true },
        fontFactor: 0.85,
        noFooter: false,
        title: 'Available Reference Files ({RECS})',
        addComponent: {
          component: null,
          data: null
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
