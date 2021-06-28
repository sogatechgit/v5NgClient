import { FilterDataType } from './../../api/mod/app-common.classes';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { CoreModule } from './../core.module';
import { MatDialog } from '@angular/material/dialog';
import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ModuleCommon } from '../module.common';

import { DataTabsComponent } from 'src/app/api/cmp/data-tabs/data-tabs.component';
import { RequestParams } from 'src/app/api/mod/app-params.model';


@Component({
  selector: 'app-chem-db',
  templateUrl: './chem-db.component.html',
  styleUrls: ['./chem-db.component.scss','./../module.common.scss'],
})
export class ChemDbComponent extends ModuleCommon {
  private dlg: MatDialog;
  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    // when the browser window is resized!
    // a method can also be called within this event handler...
    // this.RefreshGridDisplay();
    if (!this.parentContainer) {
      this._containerHeight = 480;
    } else {
      const cont = this.parentContainer.nativeElement;
      this._containerHeight = cont.offsetHeight;
    }

    console.log('\nthis.containerHeight:', this.containerHeight);

    //this.MainTab.height = this.containerHeight;
  }

  @ViewChild('t') MainTab: DataTabsComponent;
  @ViewChild('parentContainer') parentContainer: ElementRef;

  // @Input() DataSet: AppDataset;

  public TABS_COUNT: number = 19;
  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);
  }

  // ngOnInit(): void {}


  modOnInit(): void {
    //this.TableCode = 'chmhdr';
    this.TableCode = 'chmhdr';
    this.tabHeight = 250;
  }



  
  public _GetTabIdNamesq: string;

  get GetTabIdNamesq(): string {

    if (this._GetTabIdNamesq == undefined) {
      this._GetTabIdNamesq = '';
      let reqParam: RequestParams = new RequestParams();
      reqParam.includedFields = 'CHD_MOD_NAME`CHD_MOD_ID`CHD_MOD_FA_ICON';
      reqParam.code = 'chmsm';
      reqParam.sortFields = 'CHD_MOD_ORDER';
      reqParam.snapshot = true;
      reqParam.clearExisting = true;
      reqParam.pageSize = undefined;
      this.DataSet.Get([reqParam], {
        onSuccess: (data) => {
          // Assign tab name
          // console.log("data.processed.data[0]:", data.processed.data[0]);
          //console.log('Get Tab Names data: ',data);
          //console.log('Get Tab Names: ',data.processed.data[0]);

          console.log(data);

          let i: number;
          let Tabactive: string;
          let GetTabIdNamesq: string = '';
          let GetTabGen: number = 0;

          for (i = 0; i < data.processed.data[0].length; i++) {
            const currRow = data.processed.data[0][i];
            if (currRow.CHD_MOD_ID == 18) {
              Tabactive = '@' + currRow.CHD_MOD_ID;
            } else {
              Tabactive = currRow.CHD_MOD_ID;
            }

            GetTabIdNamesq += Tabactive + '|' + currRow.CHD_MOD_NAME + ',';
            GetTabGen = GetTabGen + 1;
          }

          this._GetTabIdNamesq = GetTabIdNamesq;

          if (this.MainTab) {
            setTimeout(() => this.MainTab.CalcTotalWidth(), 10);
          }
        },
        onError: (err) => {
          console.log('\nError Chem DB Module get tabs details:', err);
        },
      });
    }

    return this._GetTabIdNamesq.replace(/,\s*$/, '');
  }



  

  modAfterViewInit() {
    setTimeout(() => this.handleResize(null), 10);
  }

  private _containerHeight: number = 500;
  get containerHeight(): number {
    return this._containerHeight;
  }

  RowClick(e: any) { }

  public TabNames = [
    {
      CHD_MOD_NAME: 'Field Service',
      CHD_MOD_ID: 18,
      CHD_MOD_FA_ICON: 'fa fa-folder',
    },
    {
      CHD_MOD_NAME: 'Chemical Documents',
      CHD_MOD_ID: 17,
      CHD_MOD_FA_ICON: 'fa fa-file',
    },
    {
      CHD_MOD_NAME: 'Chemical Treatment Rates',
      CHD_MOD_ID: 16,
      CHD_MOD_FA_ICON: 'fa fa-dollar',
    },
    {
      CHD_MOD_NAME: 'Chemical Residuals',
      CHD_MOD_ID: 20,
      CHD_MOD_FA_ICON: 'fa fa-thermometer-full',
    },
    {
      CHD_MOD_NAME: 'Hydrocarbon Composition',
      CHD_MOD_ID: 1,
      CHD_MOD_FA_ICON: 'fa fa-pie-chart',
    },
    {
      CHD_MOD_NAME: 'Organic (Oil & Wax) Analysis',
      CHD_MOD_ID: 2,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'Produced Water Analysis',
      CHD_MOD_ID: 4,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'Glycol Analysis',
      CHD_MOD_ID: 12,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'Solid Analysis',
      CHD_MOD_ID: 5,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'Failure Analysis',
      CHD_MOD_ID: 6,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'Bacteria Analysis (Bacteria)',
      CHD_MOD_ID: 3,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'Bacteria Analysis (Biocide Testing)',
      CHD_MOD_ID: 7,
      CHD_MOD_FA_ICON: 'fa fa-ares-chart',
    },
    {
      CHD_MOD_NAME: 'Corrosion Coupon',
      CHD_MOD_ID: 8,
      CHD_MOD_FA_ICON: 'fa fa-envelope-open',
    },
    {
      CHD_MOD_NAME: 'Scale Coupon',
      CHD_MOD_ID: 9,
      CHD_MOD_FA_ICON: 'fa fa-envelope-open',
    },
    {
      CHD_MOD_NAME: 'BSW Readings',
      CHD_MOD_ID: 10,
      CHD_MOD_FA_ICON: 'fa fa-line-chart',
    },
    {
      CHD_MOD_NAME: 'Water Quality (Oil & Grease) Analysis',
      CHD_MOD_ID: 11,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'WHRU and Jacket Water (WHRU)',
      CHD_MOD_ID: 13,
      CHD_MOD_FA_ICON: 'fa fa-folder',
    },
    // {
    //   CHD_MOD_NAME: 'WHRU and Jacket Water (Jacket)',
    //   CHD_MOD_ID: 14,
    //   CHD_MOD_FA_ICON: 'fa fa-folder',
    // },
    {
      CHD_MOD_NAME: 'WHRU Water Analysis',
      CHD_MOD_ID: 15,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
    {
      CHD_MOD_NAME: 'Hydraulic Fluid Analysis',
      CHD_MOD_ID: 19,
      CHD_MOD_FA_ICON: 'fa fa-area-chart',
    },
  ];

  public _GetTabIdNames: string;

  get GetTabIdNames(): string {
    if (this._GetTabIdNames) return this._GetTabIdNames;

    let i: number;
    let Tabactive: string;
    let GetTabIdNames: string = '';
    let GetTabGen: number = 0;

    this.TabNames.forEach(tn => {



      if (tn.CHD_MOD_ID == 18) {
        Tabactive = '@' + tn.CHD_MOD_ID;
      } else {
        Tabactive = tn.CHD_MOD_ID.toString();
      }

      GetTabIdNames += Tabactive + '|' + tn.CHD_MOD_NAME + ',';
      GetTabGen = GetTabGen + 1;


    })
    this._GetTabIdNames = GetTabIdNames.substr(0, GetTabIdNames.length - 1);

    if (this.MainTab) {
      setTimeout(() => this.MainTab.CalcTotalWidth(), 10);
    }

    return this._GetTabIdNames;

  }
}
