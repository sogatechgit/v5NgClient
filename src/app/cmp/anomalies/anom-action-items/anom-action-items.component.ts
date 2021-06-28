import { MatDialog } from '@angular/material/dialog';
import { Component, Renderer2 } from '@angular/core';
import { AppMainServiceService } from './../../../svc/app-main-service.service';
import { ModuleCommon } from '../../module.common';

@Component({
  selector: 'app-anom-action-items',
  templateUrl: './anom-action-items.component.html',
  styleUrls: ['./anom-action-items.component.scss','./../../module.common.scss'],
})
export class AnomActionItemsComponent extends ModuleCommon {
  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);
  }

  // ngOnInit(): void {}

  modOnInit(): void {
    this.TableCode = 'ai';
  }

  modAfterViewInit() {}

  RowClick(e: any) {
  }

  SetupGrid() {
    /*****************************************************************************
     Add columns and link definitions in this section to which will be appended
     to the automatically defined columns/links using the gridColumns definition

    ==========
     Example:
    ==========
    this.grid.options
    .AddColumn({
      caption: 'Title',
      fieldName: 'AN_TITLE',
      minWidth: 275,
    })
    .AddColumn({
      caption: 'Raised By',
      fieldName: 'AN_RAISED_BY',
      width: 100,
    })
    *****************************************************************************/
    // this.grid.options;
  }
}
