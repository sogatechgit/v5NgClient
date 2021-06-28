import { FilterDataType } from './../../api/mod/app-common.classes';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { CoreModule } from './../core.module';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Renderer2,Type,EventEmitter,Output } from '@angular/core';
import { ModuleCommon } from '../module.common';

import { Observable, Subscription } from 'rxjs';
import { DetailsPopup, IPopupButton } from '../../api/cmp/details.popup';

import { DataGridBComponent } from './../../api/cmp/data-grid/data-grid-b.component';

@Component({
  selector: 'app-svy-dat-evt',
  templateUrl: './svy-dat-evt.component.html',
  styleUrls: ['./svy-dat-evt.component.scss']
})
export class SvyDatEvtComponent extends ModuleCommon {
  private dlg: MatDialog;
  @Output() EvtIdsEvtEmitr: EventEmitter<any> =   new EventEmitter();
  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);
  }

  // ngOnInit(): void {}


  modOnInit(): void {
    this.TableCode = 'svyevt';
  
  }


  modAfterViewInit() {}

  RowClick(event: any) {
    const {sender } = event;
    
    if (sender.SelectedIds.length > 0) {
      this.EvtIdsEvtEmitr.emit(sender.SelectedIds);
    }else{
      this.EvtIdsEvtEmitr.emit(sender.grid.currentRow.keyVal);
    }
  }

  SetupGrid() {

  }



}
