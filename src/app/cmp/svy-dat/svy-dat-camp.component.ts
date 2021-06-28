import { FilterDataType } from './../../api/mod/app-common.classes';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { CoreModule } from './../core.module';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, Renderer2, Type, ViewChild, Output,EventEmitter } from '@angular/core';
import { ModuleCommon } from '../module.common';

import { Observable, Subscription } from 'rxjs';
import { DetailsPopup, IPopupButton } from '../../api/cmp/details.popup';

import { DataGridBComponent } from './../../api/cmp/data-grid/data-grid-b.component';

@Component({
  selector: 'app-svy-dat-camp',
  templateUrl: './svy-dat-camp.component.html',
  styleUrls: ['./svy-dat-camp.component.scss']
})
export class SvyDatCampComponent extends ModuleCommon {

  @Output() CampIdsEvtEmitr: EventEmitter<any> =   new EventEmitter();

  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);
  }

  // ngOnInit(): void {}


  modOnInit(): void {
    this.TableCode = 'svy';
  }


  modAfterViewInit() { }

  RowClick(event: any) {

    const { e, data, sender } = event;
    //console.log('\nCampaign Selected 1 or Many rows', sender.rowIds);//Get all Grid rows ID 
    //console.log('\nCurrent row Key Value', sender.grid.currentRow.keyVal);//Get Grid Current Row ID
    //console.log('\nSelected Ids', sender.SelectedIds); //Get Grid selected rows // if length is zero then multi select is off.

    if (sender.SelectedIds.length > 0) {
      this.CampIdsEvtEmitr.emit(sender.SelectedIds);
    }else{
      this.CampIdsEvtEmitr.emit(sender.grid.currentRow.keyVal);
    }
  }


}
