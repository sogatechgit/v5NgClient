import { Component, KeyValueDiffers, Input, ViewChild } from '@angular/core';
import { DetailsCommon } from './../../../cmp/details.common';
import { FormGroup } from '@angular/forms';
import { AppFormAComponent } from './../../../api/cmp/app-form-a/app-form-a.component';
import { DataGridBComponent } from './../../../api/cmp/data-grid/data-grid-b.component';

@Component({
  selector: 'app-chem-main-tabs-details',
  templateUrl: './chem-main-tabs-details.component.html',
  styleUrls: ['./chem-main-tabs-details.component.scss']
})
export class ChemMainTabsDetailsComponent extends DetailsCommon {
  @Input() TabId: number = 0;
  @ViewChild('rfGrid') rfGrid: DataGridBComponent;

  constructor(public differs: KeyValueDiffers) {
    super(differs);


    // this section will allow customized parameter settings for the details popup
    this.popHeight = 270;
    this.tabHeight = 200;
    // this.popButtons= []

    // this.titleEdit = 'Edit ' + this.ParentActiveTabName();
    // this.titleNew = 'New ' + this.ParentActiveTabName();
    this.titleEdit = 'Edit Record ';
    this.titleNew = 'New Record ';

    // set view configurations

  }

  modOnInit() {
  }

  modAfterViewInit() {
  }


  AssignEvents() {

  }

  ResetState() {
  }

  ngOnInit() {


  }

  public get toggleDisplay(): Array<any> {
    //return this.DataSet.toggleYesNoNA;
    return [
      { value: 1, display: 'Yes' },
      { value: 0, display: 'No' },
      { value: null, display: '-' },
    ];
  }

  BeforeDataPosting(e: any) {
    // run module-specific pre-posting routine here. this required to create
    // additional information to be posted.

    // this test module is specific to Anomaly table which requires archive record be
    // created when a record is edited

    console.clear();

    const mode = e.mode;

  }

  ChangeAsset(e: any) {
    // const currAsset = this.formObject.get('AN_ASSET_ID').value;
    const currAsset = e.source.value;
    const form: AppFormAComponent = e.source.form;
    console.log('\nChangeAsset:', e.source, currAsset, form);
    form.SelectLocation().subscribe(
      (data) => {
        console.log('\nChangeLocation:', data);
      },
      (err) => { }
    );
  }

  AfterFormCreate(e: any) {
    // console.log("\nAfterFormCreate:",e)
    if (e.sender.AccessMode == 'add' && e.code == 'chmhdr') {
      // set initial values upon creation of main anomaly form object
      const frm: FormGroup = e.form;
      // form group
      frm.get('CHD_HDR_TYPE').setValue(this.GetParentActiveTabID());
      // 20210201 remove asset ID default Value of 6
      //frm.get('CHD_HDR_ASSET_ID').setValue(6);
    }
  }


  GetParentActiveTabID() {
    return this.data ? this.data.moduleExchangeInfo.detailsObject.TabId : this.moduleExchangeInfo.detailsObject.TabId
  }

  ParentActiveTab(id: number): boolean {
    return (this.data ? this.data.moduleExchangeInfo.detailsObject.TabId : this.moduleExchangeInfo.detailsObject.TabId) == id;
  }


  ParentActiveTabName(): string {
    let ActiveTabId: number = 0;
    let ActiveTabName: string = "";
    ActiveTabId = this.TabId;

    if (ActiveTabId !== 0) {

      ActiveTabId = this.GetParentActiveTabID();

      if (ActiveTabId == 1) {
        ActiveTabName = "Hydrocarbon Composition";
      } if (ActiveTabId == 2) {
        ActiveTabName = "Organic (Oil & Wax) Analysis";
      } if (ActiveTabId == 3) {
        ActiveTabName = "Bacteria Analysis (Bacteria)";
      } if (ActiveTabId == 4) {
        ActiveTabName = "Produced Water Analysis";
      } if (ActiveTabId == 5) {
        ActiveTabName = "Solid Analysis";
      } if (ActiveTabId == 6) {
        ActiveTabName = "Solid Analysis";
      } if (ActiveTabId == 7) {
        ActiveTabName = "Bacteria Analysis (Biocide Testing)";
      } if (ActiveTabId == 8) {
        ActiveTabName = "Corrosion Coupon";
      } if (ActiveTabId == 9) {
        ActiveTabName = "Scale Coupon";
      } if (ActiveTabId == 10) {
        ActiveTabName = "BSW Readings";
      } if (ActiveTabId == 11) {
        ActiveTabName = "Water Quality (Oil & Grease) Analysis";
      } if (ActiveTabId == 12) {
        ActiveTabName = "Glycol Analysis";
      } if (ActiveTabId == 13) {
        ActiveTabName = "WHRU and Jacket Water (WHRU)";
      } if (ActiveTabId == 14) {
        ActiveTabName = "WHRU and Jacket Water (Jacket)";
      } if (ActiveTabId == 15) {
        ActiveTabName = "WHRU Water Analysis";
      } if (ActiveTabId == 16) {
        ActiveTabName = "Chemical Treatment Rates";
      } if (ActiveTabId == 17) {
        ActiveTabName = "Chemical Documents";
      } if (ActiveTabId == 18) {
        ActiveTabName = "Field Service";
      } if (ActiveTabId == 19) {
        ActiveTabName = "Hydraulic Fluid Analysis";
      } if (ActiveTabId == 20) {
        ActiveTabName = "Chemical Residuals";
      } else {
        ActiveTabName = "Chemical Database";
      }

    }



    return ActiveTabName;
  }

  /** details component-specific items*/
  get assetActionIcon(): string {
    return this.AccessMode != 'view' ? 'fa fa-sitemap' : null;
  }

  ManageGridChemRF(args: any): void {
    args.abort = true;
    this.osb(
      'Sorry. Linked file management is not yet available...',
      'x',
      3000
    );
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
