import { Component, KeyValueDiffers, ViewChild } from '@angular/core';
import { AppDataset } from './../../svc/app-dataset.service';
import { DetailsCommon } from './../../cmp/details.common';
import { DataGridBComponent } from './../../api/cmp/data-grid/data-grid-b.component';
import { SvyDatCampComponent } from './svy-dat-camp.component';

@Component({
  selector: 'app-svy-dat-camp-evt-selector',
  templateUrl: './svy-dat-camp-evt-selector.component.html',
  styleUrls: ['./svy-dat-camp-evt-selector.component.scss']
})
export class SvyDatCampEvtSelectorComponent extends DetailsCommon {

  constructor(public differs: KeyValueDiffers) {
    super(differs);
  }

  modOnInit() { }


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


  public GetParentKeyVal() {
    return this.data ? this.data.moduleExchangeInfo.state.dataKeyValue : this.moduleExchangeInfo.state.dataKeyValue;
  }

  public _SelCampGridID: Array<any>;
  public SelCampGridIDs(Ids: Array<any>) {
    this._SelCampGridID = Ids;
    return this._SelCampGridID;
  }


  public _SelEvtGridID: Array<any>;
  public SelEvtGridIDs(Ids: Array<any>) {
    this._SelEvtGridID = Ids;
    return this._SelEvtGridID;
  }




}