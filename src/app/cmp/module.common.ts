import { DetailsPopup, DetailsItem } from './../api/cmp/details.popup';
import {
  ITreeFilterParams,
  TreeViewNode,
} from 'src/app/api/cmp/tree-view/tree-view.component';
import { AppDataset } from './../svc/app-dataset.service';
import { AppMainServiceService } from './../svc/app-main-service.service';
import { AppFormAComponent } from './../api/cmp/app-form-a/app-form-a.component';
import { DataGridBComponent } from './../api/cmp/data-grid/data-grid-b.component';
import { MatDialog } from '@angular/material/dialog';
import {
  Input,
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Renderer2,
} from '@angular/core';
@Component({
  template: '',
})
export abstract class ModuleCommon implements OnInit, AfterViewInit {
  @Input() data: any;

  @ViewChild('grid') grid: DataGridBComponent;
  @ViewChild('mainForm') mainForm: AppFormAComponent;

  protected modOnInit(): void {}
  protected modAfterViewInit(): void {}
  protected SetupGrid(): void {}

  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {}
  @Input() TableCode: string = null;
  @Input() TableCodeSub: string = null;

  @Input() Extra: string = null;
  @Input() ExtraSub: string = null;
  @Input() tabHeight: number = 275;

  @Input() TreeLocation: string = null;
  @Input() TreeFilterParams: ITreeFilterParams;

  @Input() CurrentTreeNode: TreeViewNode;

  @Input() parentGrid: DataGridBComponent;
  @Input() parentKeyValue: number = -1;

  private _moduleExchangeInfo: ModuleExchangeInfo = new ModuleExchangeInfo();
  public get moduleExchangeInfo(): ModuleExchangeInfo {
    return this._moduleExchangeInfo;
  }

  private _moduleState: any = {};
  public set moduleState(value: any) {
    //console.log('moduleState value:', value, this._moduleState,"\nthis.moduleExchangeInfo",this.moduleExchangeInfo);
    if (value) {
      // value.forEach(key=>{
      //   this._moduleState[key] = value[key];
      // })
      for (let key in value) {
        this._moduleState[key] = value[key];
      }
      if (this.moduleExchangeInfo.detailsObject) {
        console.log(
          '\nFORM KEY:',
          this.moduleExchangeInfo.detailsObject.form.dataKeyValue
        );
        this.moduleExchangeInfo.detailsObject.form.dataKeyValue = this._moduleState.dataKeyValue;
      }
    }
  }
  public get moduleState(): any {
    return this._moduleState;
  }

  ngOnInit() {
    this.modOnInit();
    // if (this.moduleExchangeInfo)
    //   if (this.moduleExchangeInfo.gridObject)
    setTimeout(() => {
      if (this.moduleExchangeInfo)
        if (this.moduleExchangeInfo.gridObject)
          this.moduleExchangeInfo.gridObject.RefreshClick(null);
    });
  }

  ngAfterViewInit() {
    if (this.grid) {
      // Assign DataSet object to main data grid
      // this.grid.dataSet = this.DataSet;
      // Setup datagrid options and render data grid
      this.SetupGrid();
    }
    if (this.mainForm) {
      // if main form is found in the module's template
      this.mainForm.DataSet = this.DataSet;
    }

    this.modAfterViewInit();
  }

  CallReports(args:any){
    // console.log("CallReports...",args)
  }

  get DataSet(): AppDataset {
    if (!this.dataSource) return null;
    if (!this.dataSource.ActiveSource) return null;
    return this.dataSource.ActiveSource.appDataset;
  }


}

export class ModuleExchangeInfo {
  constructor() {
    this.state = {};
  }
  public gridObject: DataGridBComponent;
  public detailsObject: any;
  public state: any;
}
