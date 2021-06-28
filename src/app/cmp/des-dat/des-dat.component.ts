import { FilterDataType } from './../../api/mod/app-common.classes';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { CoreModule } from './../core.module';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ModuleCommon } from '../module.common';

@Component({
  selector: 'app-des-dat',
  templateUrl: './des-dat.component.html',
  styleUrls: ['./des-dat.component.scss','./../module.common.scss'],
})
export class DesDatComponent extends ModuleCommon {
  private dlg: MatDialog;
  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);
  }

  // ngOnInit(): void {}


  modOnInit(): void {
    this.TableCode = 'desdat';
    this.tabHeight=200;
    // this.DataSet.SetLookupData(
    //   [
    //     { filterValue: 109 },
    //     { tableCode: 'desprm' }, // Anomaly Risk Matrix data
    //   ],
    //   (data) => {
    //     // console.log("SetLookupData Data ...",data,", this.DataSet.riskMatrixData: ",this.DataSet.riskMatrixData)
    //   }
    // );
  }

  modAfterViewInit() {}

  RowClick(e: any) {
    // console.log("\nGrid row clicked: ",e)
  }

  SetupGrid() {

  }
}
