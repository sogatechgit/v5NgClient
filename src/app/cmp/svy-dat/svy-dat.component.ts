import { FilterDataType } from './../../api/mod/app-common.classes';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { CoreModule } from './../core.module';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Renderer2, Type, Input, ViewChild } from '@angular/core';
import { ModuleCommon } from '../module.common';

import { Observable, Subscription } from 'rxjs';
import { DetailsPopup, IPopupButton } from '../../api/cmp/details.popup';
import { SvyDatCampEvtSelectorComponent } from './svy-dat-camp-evt-selector.component';


@Component({
  selector: 'app-svy-dat',
  templateUrl: './svy-dat.component.html',
  styleUrls: ['./svy-dat.component.scss']
})
export class SvyDatComponent extends ModuleCommon {
  //private CampIds: SvyDatCampEvtSelectorComponent;
  @ViewChild(SvyDatCampEvtSelectorComponent) CampEvtIds: SvyDatCampEvtSelectorComponent;
  @Input() EvetIds: Array<number> = [];

  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2,
    //public cmpIdsFromGridxxx: string
  ) {
    super(dataSource, dialog, renderer);

  }

  // ngOnInit(): void {}


  modOnInit(): void {
    this.TableCode = 'svyhdr';
    this.TableCodeSub = 'svypos';
    this.tabHeight = 200;
  }


  modAfterViewInit() { }

  RowClick(e: any) {
    // console.log("\nGrid row clicked: ",e)
  }

  SetupGrid() {

  }

  get dataManageCampEvt(): any {
    return {
      top: {
        templateGrid: this.grid,
        noLinkFilter: true,
        parentKeyValue: null,
        rights: { allowSelect: true },
        fontFactor: 0.85,
        noFooter: false,
        title: 'Available Campaign / Events ({RECS})',
      },
    };
  }


  //************** Campaign and Event Selector Code **************//


  CampEvtSelectClick(e: any) {
    console.log('\nNeo Campaign/Event Selector Event Clicked');
    //this.grid.OpenCampEvt({ e: e, data: null, defaultValues: {} });
    this.OpenCampEvt({ e: e, data: null, defaultValues: {} });
  }

  OpenCampEvt(args: any) {
    const obs = this.OpenCampEvtDetails(args.defaultValues);

    const subs = obs.subscribe(
      (data) => {
        this.grid.UpdateView(data);
      },
      (err) => {
        console.log('\nDataGridB, Error ', err);
        this.grid.osb('Error adding record.', 'x', 4000);
      },
      () => {
        subs.unsubscribe();
      }
    );
  }

  OpenCampEvtDetails(defaultValues?: any): Observable<any> {
    if (this.moduleExchangeInfo) {
      const detailsObject = this.moduleExchangeInfo.detailsObject;
      console.log('\nNeo Event Selector moduleExchangeInfo', { detailsObject })
      //SvyDatCampEvtSelectorComponent.constructor=detailsObject.constructor;
      if (detailsObject) {
        const detailsComponent: Type<any> = detailsObject.constructor;
        const args = {
          detailsItem: {
            // params of popup component SvyDatEvtComponent
            component: SvyDatCampEvtSelectorComponent, //SvyDatCampEvtSelectorComponent,
            data: {
              defaultValues: defaultValues,
              hostObject: this,
              DetailsForm: detailsObject.form, // ! do not remove, this will be used when poppping up details
              title: 'Campaign/Event Selector',
              moduleExchangeInfo: SvyDatCampEvtSelectorComponent,//SvyDatCampEvtSelectorComponent //this.moduleExchangeInfo,
            },
          },

          // params of DetailsPopup
          width: 1350,
          height: 600,
          // width: detailsObject.popWidth,
          // height: detailsObject.popHeight,

          icon: detailsObject.iconNew,
          title: 'Campaign/Event Selector',
          buttons: [{
            label: 'Apply Filter',
            style: 'btn bg-warning text-dark',
            value: 'applyfilter',
            icon: 'far fa-save text-secondary',
          },
          {
            label: 'Remove Filter',
            style: 'btn bg-secondary text-white',
            value: 'unfilter',
            icon: 'fa fa-undo text-light',
          },
          {
            label: 'Cancel',
            style: 'btn btn-sm btn-secondary',
            value: 'cancel',
            icon: 'fa fa-times-circle text-light',
          }],
        };

        const { width, height, detailsItem, icon, title, buttons } = args;

        const ref = this.dialog.open(DetailsPopup, {
          minWidth: `${width}px`,
          maxWidth: `${width}px`,
          minHeight: `${height}px`,
          maxHeight: `${height}px`,
          disableClose: true,
          data: {
            // data belonging to popup
            component: detailsItem,
            title: title,
            buttons: buttons,
            icon: icon,
            buttonClick: this.CampEvtButtonClick,
          },
        });

        return ref.afterClosed();
      }
    } else {
      return null;
    }
  }


  CampEvtButtonClick(e: { button: IPopupButton; sender: any; deft: any }) {
    const { sender } = e;
    const GetIDsfromPopupd = e.sender.data.component.data.DetailsForm;
    const nHostobj = e.sender.data.component.data.hostObject;

    const ref = e.sender.dialogRef;
    const btn = e.button;
    if (btn.value == 'applyfilter') {//_EvtIDsFromPopupClick
      GetIDsfromPopupd.parent._CampIDsFromPopupClick = sender.ChildComponent._SelCampGridID;
      GetIDsfromPopupd.parent._EvtIDsFromPopupClick = sender.ChildComponent._SelEvtGridID;
      if (ref) ref.close({ value: btn.value });
      nHostobj.RefreshHost();
      //nHostobj.modOnInit();
    } else if (btn.value == 'unfilter') {

    } else if (btn.value == 'cancel') {
      if (ref) ref.close({ value: btn.value });
    }

  }

  RefreshHost(){

    
    //reqParam.filter = opt.whereClause; // where 995 Grid B //  this.InsertColumnFilters(); // get ReqParam(): RequestParams {
    //this.grid.ReqParam.filter='(({SVY_HDR_DELETED|eq|0}|{SVY_HDR_DELETED|eq|null}))^({tre.TRE_DAT_TYPE|eq|1}^({TRE_NOD_LOC|eq|"aa"}|{TRE_NOD_LOC|lk|"aa%%"})^{SVY_EVT_DESC|eq|"CP Steel"})';
    //this.moduleExchangeInfo.gridObject.Refresh();
    this.ngOnInit();
    this.TableCode = 'svyhdr';
    this.TableCodeSub = 'svypos';
    //this.RefreshHost();
    this.grid.customGrid="gridColumns_1";
    this.grid.ngOnInit
    //this.grid.Refresh();
    
  }


  //gridColumns_1 to gridColumns_64

  get cmpGdIDs(): string {
    let cmpIdsFromGrid: Array<any>;
    if (this.moduleExchangeInfo.detailsObject !== undefined){
      cmpIdsFromGrid = this.moduleExchangeInfo.detailsObject._CampIDsFromPopupClick;
    }
    if (cmpIdsFromGrid == undefined) {
      return 'gridColumns_All';
    } else if (cmpIdsFromGrid.length) {
      return 'gridColumns_All';
    } else {
      return 'gridColumns_' + cmpIdsFromGrid.toString();
    }

  }

  // get cmpGdIDs(): any {
  //   let cmpIdsFromGrid: Array<any>;
  //   if (this.moduleExchangeInfo.detailsObject !== undefined){
  //     cmpIdsFromGrid = this.moduleExchangeInfo.detailsObject._CampIDsFromPopupClick;
  //   }
  //   if (cmpIdsFromGrid == undefined) {
  //     return 'All';
  //   } else if (cmpIdsFromGrid.length) {
  //     return 'All';
  //   } else {
  //     return cmpIdsFromGrid;
  //   }

  // }

  //************** Campaign and Event Selector Code End Here **************//


}
