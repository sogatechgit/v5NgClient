import { AppDataset } from './../../svc/app-dataset.service';
import { DataGridBComponent } from './../../api/cmp/data-grid/data-grid-b.component';
import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  AfterViewChecked,
  AfterContentChecked
} from '@angular/core';

@Component({
  selector: 'app-test-sub-list',
  templateUrl: './test-sub-list.component.html',
  styleUrls: ['./test-sub-list.component.scss'],
})
export class TestSubListComponent implements OnInit, AfterViewInit,AfterViewChecked,AfterContentChecked {
  @ViewChild('grid') grid: DataGridBComponent;

  constructor() {}

  @Input() parent:any = null;

  @Input() gridHeight: number = 200;
  @Input() dataSet: AppDataset = null;
  @Input() parentKeyValue:number=null;

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    if(this.grid)this.SetupGrid();
  }
  ngAfterViewChecked(){
    //console.log("\n*********ngAfterViewChecked...");
  }
  ngAfterContentChecked(){
    // console.log("\n*********ngAfterContentChecked...");
  }

  onDataExtracted(e:any){
    console.log("\nonDataExtracted...",e)
  }

  SetupGrid() {
    if (!this.grid) return;
    console.log(
      '\nSublist test SetupGrid...',
      this.grid.dataSet,
      this.grid.tableCode,
      this.grid.parentTableCode
    );

    //this.grid.dataSet = this.module.ds;
    // this.grid.tableCode = 'rf';
    // this.grid.parentTableCode = this.module.mainGridOptions.code;

    this.grid.options
      .AddColumn({
        caption: 'Description',
        fieldName: 'RF_DESC',
        minWidth: 200,
        allowFilter: false,
      })

      .AddColumn({
        caption: 'Type',
        fieldName: 'RF_TYPE',
        minWidth: 100,
        allowFilter: false,

        lookupParams: {
          inlineLookupFieldAlias: 'RFTYPE',
          inlineLookupTableAlias: 'rftyp',
          inlineLookupTableField: 'LKP_DESC_B',
        },
      })
      .AddColumn({
        caption: 'Class',
        fieldName: 'RF_CLASS',
        minWidth: 100,
        allowFilter: false,

        lookupParams: {
          inlineLookupFieldAlias: 'RFCLASS',
          inlineLookupTableAlias: 'rfcls',
          inlineLookupTableField: 'LKP_DESC_B',
        },
      })
      .AddColumn({
        caption: 'Filename',
        fieldName: 'RF_FILENAME',
        minWidth: 500,
        allowFilter: false,
      })

      // .ShowColumns([ 'RF_DESC', 'RF_TYPE', 'RF_CLASS','RF_FILENAME'])
      .LeftJoin({
        code: 'lkp',
        alias: 'rftyp',
        localField: 'RF_TYPE',
      })
      .LeftJoin({
        code: 'lkp',
        alias: 'rfcls',
        localField: 'RF_CLASS',
      });

      this.grid.resetColumnWidths();
  }
}
