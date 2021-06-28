import { ApiCommonModule } from './../api/cmp/api-common/api-common.module';
import { IRegularTableConfig } from './../api/mod/app-common.classes';
import { IPopupButton, IPopupPrompts } from './../api/cmp/details.popup';
import { ModuleExchangeInfo } from './module.common';
import { MatDialog } from '@angular/material/dialog';
import { AppFormAComponent } from './../api/cmp/app-form-a/app-form-a.component';
import { AppDataset } from './../svc/app-dataset.service';
import {
  Input,
  ViewChild,
  Component,
  AfterViewInit,
  OnInit,
  DoCheck,
  KeyValueDiffers,
  KeyValueDiffer,
} from '@angular/core';
import { AppModule } from '../app.module';

@Component({
  template: '',
})
export abstract class DetailsCommon implements OnInit, AfterViewInit {
  @Input() data: any;
  @Input() parent: any = null;

  @Input() linkToParent:boolean;

  private _parentKeyValue:number;
  @Input() set parentKeyValue(value:number){
    this._parentKeyValue=value;
  }

  private _parentKeyValueOld: number = -1;
  get parentKeyValue(): number {

    if(this._parentKeyValue!=undefined) return this._parentKeyValue;


    // return -1;
    let newValue: number = -1;
    // if (this.grid) {
    //   newValue = this.grid.keyValue;
    // } else {
    if (this.data) {
      if(this.data.moduleExchangeInfo){
        // get value from the original details form object
        const parKeyVal = this.data.moduleExchangeInfo.detailsObject ? this.data.moduleExchangeInfo.detailsObject.parentKeyValue : undefined;
        if(parKeyVal != undefined) return parKeyVal;

      }else{
        newValue = this.data.parentKeyValue;
      }
    }
    // }

    if (this._parentKeyValueOld != newValue) {
      this.ResetState();
      this._parentKeyValueOld = newValue;
    }

    return newValue;
  }




  @Input() TableCode: string = null;
  @Input() TableCodeSub: string = null;

  @Input() isNoDetailView: boolean = false;

  private _RecordType: number = null;
  @Input() set RecordType(value: number) {
    this._RecordType = value;
  }
  get RecordType(): number {
    return this._RecordType;
  }

  @Input() ExtraSettings: any = null;

  @Input() Extra: string = null;
  @Input() ExtraSub: string = null;

  popWidth: number = 800;
  popHeight: number = 600;

  @Input() tabHeight: number = 300;

  titleEdit: string = 'Edit';
  titleNew: string = 'New';

  iconEdit: string = 'far fa-edit';
  iconNew: string = 'far fa-file-alt';

  get popButtons(): Array<IPopupButton> {
    return this.DataSet
      ? this.DataSet.apiCommon
        ? this.DataSet.apiCommon.popButtons
        : null
      : null;
  }

  get popPrompts(): IPopupPrompts {
    return this.DataSet
      ? this.DataSet.apiCommon
        ? this.DataSet.apiCommon.popPrompts
        : null
      : null;
  }

  get locked():boolean{
    return this.form ? this.form.locked : false
  }

  private _moduleExchangeInfo: ModuleExchangeInfo;
  @Input() set moduleExchangeInfo(value: ModuleExchangeInfo) {
    value.detailsObject = this;
    this._moduleExchangeInfo = value;
  }
  get moduleExchangeInfo(): ModuleExchangeInfo {
    return this._moduleExchangeInfo ? this._moduleExchangeInfo : this.data ? this.data.moduleExchangeInfo : undefined
    //return this._moduleExchangeInfo;
  }

  private _detailsState: any = {};
  @Input() set detailsState(value: any) {
    if (this._detailsState.detailComponent == undefined)
      this._detailsState.detailComponent = this;

    this._detailsState = value;

    console.log('\nDetail State Assigned!!!');
    // if (value) {
    //   for(let key in value)this._detailsState[key] = value[key]
    // }
  }

  // private differs: KeyValueDiffers
  private differ: KeyValueDiffer<string, any>;
  constructor(public differs: KeyValueDiffers) {
    this.differ = this.differs.find({}).create();
  }

  ngDoCheck() {
    const change = this.differ.diff(this);

    if (change) {
      change.forEachChangedItem((item) => {
        const key = item.key;

        switch (key) {
          case '_dataKeyValue':
            if (this.form) this.form.dataKeyValue = this._dataKeyValue;
            this.OnRecordKeyChanged();
            break;
          case '_RecordType':
            this.OnRecordTypeChanged();
            break;
          default:
        }
      });
    }
  }
  private _dataKeyValue: number = null;
  @Input() set dataKeyValue(value: number) {
    this._dataKeyValue = value;
  }
  get dataKeyValue(): number {
    return this._dataKeyValue;
  }

  get isViewMode(): boolean {
    return this.AccessMode != 'edit' && this.AccessMode != 'add';
  }

  // get detailsState(): any {
  //   if (this._detailsState.dataKeyValue == undefined)
  //     this._detailsState.dataKeyValue = null;

  //   let { dataKeyValue } = this._detailsState;
  //   if (this._dataKeyValue != dataKeyValue) {
  //     this._dataKeyValue = dataKeyValue;
  //   }

  //   return this._detailsState;
  // }

  // @Input() AccessMode: string = 'view'; // view, add, edit

  private _AccessMode: string;
  @Input() set AccessMode(value: string) {
    this._AccessMode = value;
  }
  get AccessMode(): string {
    if (!this._AccessMode && this.data) {
      if (this.data.AccessMode) this.AccessMode = this.data.AccessMode;
    }
    return this._AccessMode;
  }

  // private _grid: DataGridBComponent;
  // @Input() set grid(value: DataGridBComponent) {
  //   this._grid = value;
  // }
  // get grid(): DataGridBComponent {
  //   if (!this._grid && this.data) {
  //     if (this.data.grid) this.grid = this.data.grid;
  //   }
  //   return this._grid;
  // }

  private _DataSet: AppDataset;
  @Input() set DataSet(value: AppDataset) {
    this._DataSet = value;
    // console.log("\nthis.DataSet.riskMatrixDat: ",this.DataSet.riskMatrixData )
  }
  get DataSet(): AppDataset {
    if (!this._DataSet && this.data) {
      if (this.data.DataSet) this.DataSet = this.data.DataSet;
    }
    return this._DataSet;
  }

  get ExchangeInfo(): ModuleExchangeInfo {
    if (this.data) {
      return this.data.moduleExchangeInfo;
    } else {
      return this.moduleExchangeInfo;
    }
  }

  // get instance of wrapper form component
  @ViewChild(AppFormAComponent) form: AppFormAComponent;

  protected AssignEvents(): void {} // dummy method which will
  protected modOnInit(): void {} // dummy method which will
  protected modAfterViewInit(): void {} // dummy method which will
  protected ResetState(): void {} // dummy method which will

  ngOnInit() {
    this.modOnInit();
  }

  ngAfterViewInit(): void {
    // console.log("\n@@@@@ DETAILS Common ngAfterViewInit")

    // this.grid = this.parent.grid;
    // this.DataSet = this.parent.DataSet;

    // console.log("DETAILS PARENT now:", this.parent.grid)
    // setTimeout(()=>console.log("DETAILS PARENT after 1s:", this.parent.grid),1000);

    // console.log("ngAfterViewInit DETAILS PARENT:", this.parent)
    if (this.data == undefined) {
      // details version of the component rendered together with the grid.
      //
      // parent data grid is supplied, set form object of the data grid to the detail's form object
      // this is normally the case when the details component is instantiated together with the main
      // data grid (ie. DataGridB Component)

      // assign component form properties with data grid propeties
      //

      if (this.form) {
        this.form.DataSet = this.DataSet;

        this.form.TableCode = this.TableCode;
        this.form.TableCodeSub = this.TableCodeSub;

        this.form.Extra = this.Extra;
        this.form.ExtraSub = this.ExtraSub;

        this.form.moduleExchangeInfo = this.moduleExchangeInfo;
      }

      // also in this block is where the add, edit, delete trigger function is assigned to the grid
      // AssignEvents is only called if the component is redered in a parent component
      // together with the data grid. Otherwise if the component was inserted dynamically on a popup
      // window, AssignEvents will be skipped.
      //
      this.AssignEvents();
      //
    } else {
      // popped up version of the component
      // console.log('\nAssign properties to popped up form ...', this.data);

      const detailsForm: AppFormAComponent = this.data.DetailsForm;

      this.DataSet = detailsForm.DataSet;
      this.form.DataSet = detailsForm.DataSet;

      // table codes are appended with JoinExpressions inherited from the
      // details form view in order to reprocess join expressions locally

      this.form.TableCode =
        detailsForm.TableCode +
        (detailsForm.JoinExpression ? '|' + detailsForm.JoinExpression : '|');

      if (detailsForm.TableCodeSub)
        this.form.TableCodeSub =
          detailsForm.TableCodeSub +
          (detailsForm.JoinExpressionSub
            ? '|' + detailsForm.JoinExpressionSub
            : '|');

      this.form.Extra = detailsForm.Extra;
      this.form.ExtraSub = detailsForm.ExtraSub;

      // assign dataKeyValue to popup form to trigger form requery
      this.form.dataKeyValue = detailsForm.dataKeyValue;

      let typeAssigned: boolean = false;

      if (this.data.defaultValues) {
        // search defaultValues and set record type if the type field is one of
        // the properties...

        this.form.defaultValues = this.data.defaultValues;

        const tbl = detailsForm.DataSet.tables[detailsForm.TableCode];
        const cfg: IRegularTableConfig = tbl.TableConfig;
        if (cfg) {
          if (cfg.recordTypeField) {
            const defType = this.data.defaultValues[cfg.recordTypeField];
            if (defType) {
              typeAssigned = true;
              this.form.recordType = defType;
            }
          }
        }
      }

      // assign recordType to popup form to trigger subTable assignment
      if (!typeAssigned) this.form.recordType = detailsForm.recordType;

      //
      this.AccessMode = this.data.AccessMode;

      // create a property in component data that exposes the
      // newly created component instance
      this.data.componentInstance = this;
      this.form.moduleExchangeInfo = this.data.moduleExchangeInfo;

      // console.log("#### POPUP this.data.moduleExchangeInfo",this.data.moduleExchangeInfo)
    }

    // Register current component in the form object as 'parent'
    if (this.form) this.form.parent = this;

    this.modAfterViewInit();
  }

  /************************************* Properties  ***********************************/

  // AddListener(args: {
  //   detailsItem: DetailsItem;
  //   width: number;
  //   height: number;
  //   icon?: string;
  //   title?: string;
  //   buttons?: any;
  // }): Function {
  //   const { width, height, detailsItem, icon, title, buttons } = args;
  //   return () => {
  //     const ref = this.dialog.open(DetailsPopup, {
  //       minWidth: `${width}px`,
  //       minHeight: `${height}px`,
  //       disableClose: false,
  //       data: {
  //         // data belonging to popup
  //         component: detailsItem,
  //         title: title,
  //         buttons: buttons,
  //         icon: icon,
  //       },
  //     });

  //     return ref.afterClosed();
  //   };
  // }

  public get ExtraDetailsSettings(): any {
    if (this.data) {
      return this.data.moduleExchangeInfo
        ? this.data.moduleExchangeInfo.detailsObject
          ? this.data.moduleExchangeInfo.detailsObject.ExtraSettings
          : null
        : null;
    } else {
      return this.ExtraSettings;
    }
  }

  public get toggleDisplay(): Array<any> {
    return [
      { value: 1, display: 'Yes' },
      { value: 0, display: 'No' },
      { value: null, display: '-' },
    ];
  }

  osb(
    message: string,
    action?: string,
    duration?: number,
    horizontalPosition?: any,
    verticalPosition?: any
  ): void {
    this.DataSet.openSnackBar(
      message,
      action,
      duration,
      horizontalPosition,
      verticalPosition
    );
  }

  OnRecordTypeChanged(): void {
    if (this.form) {
      this.form.recordType = this._RecordType;
    }
  }


  OnRecordKeyChanged():void{

  }
}
