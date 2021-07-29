import { FileUploaderComponent } from './../file-uploader/file-uploader.component';
import { FilterListComponent } from './../filter-parameters/filter-list.component';
import { ToolbarButtonComponent } from './../toolbar/toolbar-button.component';
import { ProgressMaskComponent } from './../progress-mask/progress-mask.component';
import { AppMainServiceService } from './../../../svc/app-main-service.service';
import {
  IRegularTableConfig,
  ILookupTableConfig,
  FilterDataType,
  IFieldDefParam,
  DataColumn,
} from './../../mod/app-common.classes';
import { ColumnInfo, FieldInfo } from './../../mod/app-column.model';
import { DetailsPopup, IPopupButton } from './../details.popup';
import { ModuleExchangeInfo } from './../../../cmp/module.common';
import { FormGroup } from '@angular/forms';
import { RecordTypeSelectComponent } from './../data-grid/record-type-select.component';
import { AppFormAComponent } from './../app-form-a/app-form-a.component';
import { Observable, Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  RequestParams,
  SQLJoinChars,
  ILookupParams,
  IFromClauseLink,
} from './../../mod/app-params.model';
import { AppDataset, IAccessRights } from './../../../svc/app-dataset.service';
import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  AfterViewInit,
  ViewChild,
  KeyValueDiffers,
  KeyValueDiffer,
  ContentChild,
  AfterViewChecked,
  OnDestroy,
  Type,
  HostListener,
  ElementRef,
} from '@angular/core';
import {
  DataGridOption,
  DataGridComponent,
  DataGridColumn,
  IDataGridColumn,
} from './data-grid.component';
import { DataGridBMgtComponent } from './data-grid-bmgt.component';
import {
  ITreeFilterParams,
  TreeViewNode,
} from '../tree-view/tree-view.component';
import { Button } from 'protractor';
import { IRequestInfo, ITreeTableConfig } from '../../mod/app-common.classes';
import { ReturnStatement } from '@angular/compiler';

@Component({
  selector: 'app-data-grid-b',
  templateUrl: './data-grid-b.component.html',
  styleUrls: ['./data-grid-b.component.scss'],
})
export class DataGridBComponent
  implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  //
  @Input() reportPageSize: number = 50;
  @Input() flatTable:boolean = false;

  @Input() gridHeaderClassName: string;

  private _extFilterExpression: string = ""
  @Input() set extFilterExpression(value: string) {
    this._extFilterExpression = value;
    console.log("set extFilterExpression : ", value, ", this.ReqParam: ", this.ReqParam)
    
  }

  get extFilterExpression(): string {
    return this._extFilterExpression;
  }


  private _pageSizes: Array<number> = [200, 500, 1000, 1500, 2000, 3000];
  @Input() set pageSizes(value: Array<number>) {
    if (value == null) {
      this._pageSizes = [];
    } else {
      this._pageSizes = value;
    }
  }
  get pageSizes(): Array<number> {
    return this._pageSizes;
  }
  //[10,50,100,200,500]
  @Input() promptTexts: any = {};
  @Input() promptWidths: any = {};

  ngOnInit(): void {
    this._reqInfo.pageSize = this.DEFAULT_PAGE_SIZE;

    const treCfg: ITreeTableConfig = this.dataSet.TreeTableConfig;
    const node = this.dataSet.NodesTable;

    const tbl = this.sourceTable;
    const asset: ColumnInfo = tbl.AssetField;

    const { subTable, deletedFlagField } = tbl.clientConfig;

    // if tableCodeSub is not set because parentKeyValue
    // is not specified in component's declaration ...
    // if (!this.tableCodeSub && subTable) this.tableCodeSub = subTable;

    if (deletedFlagField) this._deletedField = deletedFlagField;

    if (treCfg.TreeTable && node && asset) {
      this._TreeFilterParams = {
        treeTableCode: treCfg.TreeTable.tableCode,
        treeTableLocationField: treCfg.locationField,
        treeDataTableCode: node.tableCode,
        localTreeDataField: asset.name,
        treeTableDataField: treCfg.dataField,
      };
    } else {
      this._TreeFilterParams = null;
    }

    const opt: DataGridOption = this.options;
    if (this.TreeFilterParams) {
      const {
        treeTableCode,
        treeTableLocationField,
        treeDataTableCode,
        localTreeDataField,
        treeTableDataField,
      } = this.TreeFilterParams;

      // join node/asset table...
      opt.InnerJoin({
        code: node.tableCode,
        localField: localTreeDataField,
        foreignField: node.keyName,
      });

      // include tree join for main grid onl
      if ((this.CurrentTreeNode ? true : false) && !this.noTreeLink)
        opt.InnerJoin({
          code: treeTableCode,
          localField: localTreeDataField,
          foreignField: treeTableDataField,
        });

      //
    } else {
      console.log('\nGrid-B Options not set!');
    }

    // if deleted field is defined, include it as one of filter parameters
    if (this._deletedField) {
      opt.BaseFilterClear();

      opt.BaseFilterDefineOn();
      // opt.BaseWhereMode = true;
      // opt._BaseWhereTree = [];

      opt.ORS();

      // deleted field must be equal to 0 or null
      opt.Equal({ fieldName: this._deletedField }, 0);
      opt.Equal({ fieldName: this._deletedField }, null);

      opt.ORE();

      opt.BaseFilterDefineOff();
    }

    console.log("this.autoGrid || this.customGrid : ", this.autoGrid, " ### ")

    if (this.autoGrid || this.customGrid) {
      // perform data grid columns definition using the
      // gridColumns definition in table configuration
      const tblCfg: IRegularTableConfig = tbl.TableConfig;
      const gridCfg: Array<any> = this.customGrid
        ? tbl.clientConfig[this.customGrid]
        : tblCfg.gridColumns;

      if (gridCfg) gridCfg.forEach((gcol) => this.SetGridColumnDef(gcol));
    } else {
      // grid column definition is done within the component controller
      console.log('\nDataGrid-B parent: ', this.parent);
    }

    // setTimeout(()=>{
    //   this.parentKeyValue = 64;
    // },5000)
    if (!this.moduleExchangeInfo) {
      // list is used on its own and not embedden in a module
      if (this.autoQuery)
        setTimeout(() => this.ExtractDataCall({ noMask: this.noMaskOnInit }));
    }
  }

  ngOnDestroy() { }
  ngAfterViewChecked() { }

  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    // simply adding this event declaration, triggers recalculation of column widths
    // when the browser window is resized!
    // a method can also be called within this event handler...
    // this.RefreshGridDisplay();
    // if (this.GRID_WRAPPER && this.details && this._ready) {
    //   if (!this.details.form) return;
    //   const formWrapper = this.details.form.FORM_WRAPPER.nativeElement;
    //   const newGridHeight =
    //     this.GRID_WRAPPER.nativeElement.offsetHeight - formWrapper.offsetHeight;
    //   this.gridHeight = newGridHeight - 40;
    // }
  }

  @ViewChild('GRID_WRAPPER') GRID_WRAPPER: ElementRef;
  @ViewChild('GRID_CONTAINER') GRID_CONTAINER: ElementRef;

  @ViewChild('grid') grid: DataGridComponent;
  @ViewChild('mask') mask: ProgressMaskComponent;

  @ViewChild('filterList') filterList: FilterListComponent;
  @ViewChild('btnFilter') btnFilter: ToolbarButtonComponent;

  @ContentChild('details') details: any;

  @Input() compId: string;

  @Input() name: string;

  @Input() parent: any = null;
  @Input() gridRowsStateName: string = 'gridRows';
  @Input() noInitFocus: boolean = false;
  @Input() noExtras: boolean = false;
  @Input() noTreeLink: boolean = false;

  @Input() noMaskOnInit: boolean = false;

  @Input() noBarMenu: boolean = false;
  @Input() defaultPageSizeIndex: number = 0;

  @Input() activeFiltering: boolean = false;

  @Input() gridManagementData: any = {};

  @Input() CampEvtSelectorGrid: any = {};//Neo 20210413
  @Input() labelCampEvt: string = 'Campaign/Event Selector';//Neo 20210413
  @Input() labelAdd: string = 'Add';
  @Input() labelEdit: string = 'Edit';
  @Input() labelDelete: string = 'Delete';
  @Input() labelManage: string = 'Manage';
  @Input() labelExcel: string = 'Excel';
  @Input() labelPrint: string = 'Print';
  @Input() labelRefresh: string = 'Refresh';
  @Input() labelFilter: string = 'Filter';
  @Input() labelOpen: string = 'Open';
  @Input() labelReport: string = 'Report';

  @Input() labelSelect: string = 'Select';
  @Input() labelSelectAll: string = 'Select All';
  @Input() labelUnselectAll: string = 'Unselect All';
  @Input() labelInverse: string = 'Inverse Selection';

  get DEFAULT_PAGE_SIZE(): number {
    return this.pageSizes[this.defaultPageSizeIndex];
  }

  private _ready: boolean = false;

  private _noFooter: boolean = true;
  private _forceNoFooter: boolean = false;
  @Input() set noFooter(value: boolean) {
    if (value) this._forceNoFooter = true;
    this._noFooter = value;
  }

  get withCurrent(): boolean {
    if (this.sourceRows.length == 0) return false;
    return this._gridRow ? true : false;
  }

  // ******* button tool tips *************
  get delToolTip(): string {
    const cnt = this.SelectedCount;
    if (cnt == 0) return 'No selected record(s) to delete';
    else return `Selected ${cnt} record${cnt > 1 ? 's' : ''} to delete`;
  }

  get editToolTip(): string {
    const cnt = this.SelectedCount;
    if (cnt == 0) return 'No selected record(s) to edit';
    else if (cnt == 1) return 'Edit selected record';
    else return 'Multiple-record edit is not yet allowed';
  }

  get filtSelToolTip(): string {
    return !this.FilterSelectedFlag
      ? 'Show only marked records'
      : 'Show marked and unmarked records';
  }

  get selTip(): string {
    return `Turn ${this.SelectMode ? 'off' : 'on'} multi-record selection mode`;
  }

  get deletePrompt(): string {
    const cnt = this.SelectedCount;
    const defPrompt = `You are about to delete ${cnt == 1 ? 'the current' : String(cnt) + ' selected'
      } record${cnt > 1 ? 's' : ''}.<br/>Do you want to continue?`;

    const prompt = this.promptTexts ? this.promptTexts.delete : null;
    return prompt ? prompt : defPrompt;
  }

  // ******* rights properties start *******
  get allowEdit(): any {
    if (!this.rights) return undefined;
    if (this.rights.allowEdit == undefined) return undefined;

    return this.rights.allowEdit && this.withCurrent;
  }

  GetRights(rightName: string): any {
    if (!this.rights) return undefined;
    if (this.rights[rightName] == undefined) return undefined;

    if (this.isLoadingRecords) return false;

    const reqCurr: boolean =
      rightName == 'allowEdit' || rightName == 'allowDelete';

    return this.rights[rightName] && (reqCurr ? this.withCurrent : true);
  }
  // ******* rights properties end *******

  get noFooter(): boolean {
    // return true;
    if (this.reqInfo.pageNumber) return false;
    return this._noFooter;
    // return this._noFooter && !this.reqInfo.pageNumber;
  }

  get isTreeFiltering(): boolean {
    if (!this.CurrentTreeNode) return false;
    return this._TreeFilterParams ? true : false;
  }

  get linkFilter(): boolean {
    return this.forwardLink != undefined;
  }

  private _gridDefName: string;
  get gridDefName(): string {
    if (!this._gridDefName)
      this._gridDefName = this.customGrid ? this.customGrid : 'gridColumns';
    return this._gridDefName;
  }
  get includeExtraJoins(): boolean {
    if (this.noExtras) return false;
    return this.extraJoins ? true : false;
  }

  private _extraJoins: string;
  get extraJoins(): string {
    if (this._extraJoins != undefined) return this._extraJoins;

    const cfg = this.sourceTableConfig;
    if (!cfg) return '';

    if (cfg.extra ? cfg.extra[this.gridDefName] : false) {
      this._extraJoins = cfg.extra[this.gridDefName].joins;
    } else {
      this._extraJoins = cfg.extraJoins;
    }

    return this._extraJoins;
  }

  get includeExtraFields(): boolean {
    if (this.noExtras) return false;
    return this.extraFields ? true : false;

    // const cfg = this.sourceTableConfig;
    // if (!cfg) return false;

    // return cfg.extraFields ? true : false;
  }

  private _extraFields: string;
  get extraFields(): string {
    if (this._extraFields != undefined) return this._extraFields;

    const cfg = this.sourceTableConfig;
    if (!cfg) return '';

    if (cfg.extra ? cfg.extra[this.gridDefName] : false) {
      this._extraFields = cfg.extra[this.gridDefName].fields;
    } else {
      this._extraFields = cfg.extraFields;
    }
    return this._extraFields;
  }

  get isFilteredByRecordType(): boolean {
    if (!this._parentKeyValue) return false;
    if (this.linkFilter) return false;
    return this.RecordTypeInfo ? true : false;
  }

  @Input() addListener: Function = null;
  @Input() editListener: Function = null;
  @Input() deleteListener: Function = null;
  @Input() bypassDeleteAction: boolean = false;
  @Input() printListener: Function = null;
  @Input() excelListener: Function = null;
  @Input() filterListener: Function = null;

  @Input() fontFactor: number = 1;
  @Output() campEvtClick: EventEmitter<any> = new EventEmitter();
  @Output() manageClick: EventEmitter<any> = new EventEmitter();
  @Output() addClick: EventEmitter<any> = new EventEmitter();
  @Output() editClick: EventEmitter<any> = new EventEmitter();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter();
  @Output() excelClick: EventEmitter<any> = new EventEmitter();
  @Output() openClick: EventEmitter<any> = new EventEmitter();
  @Output() selectClick: EventEmitter<any> = new EventEmitter();
  @Output() refreshClick: EventEmitter<any> = new EventEmitter();

  @Output() rowClick: EventEmitter<any> = new EventEmitter();
  @Output() dataExtracted: EventEmitter<any> = new EventEmitter();

  @Input() title: string = '';
  @Input() manageTitle: string = 'Manage Linked Items';
  // @Input() gridHeight: number;
  @Input() gridBottomOffset: number = 40;

  @Input() RowHeaderHeight: number = 24;
  @Input() RowHeaderWidth: number = 20;
  @Input() RowHeight: number = 22;

  @Input() msgLoadingDetails: string = 'Loading details. Please wait...';
  @Input() icoLoadingRecords: string = 'fa fa-spinner fa-spin fa-1x fa-fw';

  @Input() msgLoadingRecords: string = 'Loading records. Please wait...';
  @Input() icoLoadingDetails: string = 'fa fa-spinner fa-spin fa-1x fa-fw';

  @Input() autoGrid: boolean = false;
  @Input() autoQuery: boolean = true;

  @Input() customGrid: string = '';

  @Input() rights: IAccessRights = {};
  @Input() gridHeight: number = 100;

  @Input() maxItems: number;

  public _isLoadingRecords: boolean = false;
  get isLoadingRecords(): boolean {
    return this._isLoadingRecords;
  }
  set isLoadingRecords(value: boolean) {
    this._isLoadingRecords = value;
  }

  public _isLoadingDetail: boolean = false;
  get isLoadingDetail(): boolean {
    return this._isLoadingDetail;
  }

  private _gridHeightCalc: number = 200;
  get gridHeightCalc(): number {
    if (!this._ready) return this._gridHeightCalc;
    if (this.GRID_CONTAINER)
      return this.GRID_CONTAINER.nativeElement.offsetHeight - 3;
    // return this.GRID_CONTAINER.nativeElement.offsetHeight - 400;
    // return 200;
    // if (this.GRID_WRAPPER && this.details) {
    //   if (!this.details.form) return 200;
    //   const formWrapper = this.details.form.FORM_WRAPPER.nativeElement;
    //   const newGridHeight =
    //     this.GRID_WRAPPER.nativeElement.offsetHeight - formWrapper.offsetHeight;
    //   //this.gridHeight = newGridHeight - 50;
    //   return newGridHeight > 800 ? 200 : newGridHeight;
    // }else{
    //   return 200;
    // }

    return this._gridHeightCalc;
  }

  private _form: AppFormAComponent = null;
  @Input() set form(value: AppFormAComponent) {
    this._form = value;
  }
  get form(): AppFormAComponent {
    return this._form;
  }

  private _formObject: FormGroup = null;
  @Input() set formObject(value: FormGroup) {
    this._formObject = value;
  }
  get formObject(): FormGroup {
    return this._formObject;
  }

  private _formObjectSub: FormGroup = null;
  @Input() set formObjectSub(value: FormGroup) {
    this._formObjectSub = value;
  }

  private _CurrentTreeNode: TreeViewNode = null;
  @Input() set CurrentTreeNode(value: TreeViewNode) {
    this._CurrentTreeNode = value;
  }
  get CurrentTreeNode(): TreeViewNode {
    return this._CurrentTreeNode;
  }

  get formObjectSub(): FormGroup {
    return this._formObjectSub;
  }

  public get gridPortHeight(): number {
    const totalHeight = this.gridHeight ? this.gridHeight : 200;
    return totalHeight - this.gridBottomOffset + (this.noToolbar ? 19 : 0);
  }

  @Input() forceToolbar: boolean = false;
  public get noToolbar(): boolean {
    if (this.forceToolbar) return false;
    const {
      allowCampEvt,//Neo 20210413
      allowAdd,
      allowEdit,
      allowDelete,
      allowExcel,
      allowManage,
      allowSelect,
    } = this.rights;
    return (
      allowCampEvt == undefined &&//Neo 20210413
      allowAdd == undefined &&
      allowEdit == undefined &&
      allowDelete == undefined &&
      allowExcel == undefined &&
      allowSelect == undefined &&
      allowManage == undefined
    );
  }

  private _moduleExchangeInfo: ModuleExchangeInfo;
  @Input() set moduleExchangeInfo(value: ModuleExchangeInfo) {
    value.gridObject = this;

    this._moduleExchangeInfo = value;
  }
  get moduleExchangeInfo(): ModuleExchangeInfo {
    return this._moduleExchangeInfo;
  }

  private _sourceRows: Array<any> = null;
  @Input() set sourceRows(value: Array<any>) {
    // const state = this.state;
    // if(state){
    //   state[this.gridRowsStateName] = value
    // }else{
    //   this._sourceRows = value;
    // }

    this._sourceRows = value;
    //setTimeout(()=>{if(this.grid)this.grid.Refresh()});
  }
  get sourceRows(): Array<any> {
    const rows = this.sourceRowsRawValue;
    if (!rows) return [];
    return rows;
  }

  private _detailRow: any = null;
  get detailRow(): any {
    return this._detailRow;
  }

  private _detailRowSub: any = null;
  get detailRowSub(): any {
    return this._detailRowSub;
  }

  get sourceRowsRawValue(): Array<any> {
    // const state = this.state;
    // if (state) {
    //   const gridRows = state[this.gridRowsStateName];
    //   if (gridRows) return gridRows
    // }
    return this._sourceRows;
  }

  onFocus(e: any) {
    e.srcElement.blur();
  }

  private _dataSet: AppDataset;
  @Input() set dataSet(value: AppDataset) {
    this._dataSet = value;
    this.SetDataParameters();
  }
  get dataSet(): AppDataset {
    return this._dataSet;
  }

  @Input() includeDeleted: boolean = false;

  private _tableCode: string = null;
  private _deletedField: string;
  private _joinExpression: string;
  @Input() set tableCode(value: string) {
    const valArr = (value + '|').split('|');
    this._tableCode = valArr[0];
    this._joinExpression = valArr[1];

    this.SetDataParameters();
  }
  get tableCode(): string {
    return this._tableCode;
  }

  get rowIds(): Array<number> {
    if (!this.grid) return [];
    if (!this.grid.sourceRows) return [];
    const ret: Array<number> = [];
    const key = this.grid.sourceTable.keyName;

    this.grid.sourceRows.forEach((row) => {
      ret.push(row[key]);
    });
    return ret;
  }

  private _tableCodeSub: string;
  private _joinExpressionSub: string = null;
  @Input() set tableCodeSub(value: string) {
    const valArr = (value + '|').split('|');
    this._tableCodeSub = valArr[0];
    this._joinExpressionSub = valArr[1];
  }
  get tableCodeSub(): string {
    return this._tableCodeSub;
  }
  // to be used to filter data by specified group field
  // (existing in the source table and not by link table) value
  @Input() GroupField: string = '';

  // to be used to filter data by TreeLocation
  get TreeDataField(): string {
    // this is the data field in the tree structure which corresponds to the
    // tree data details and TreeDtaField in the table being filtered
    if (!this.TreeFilterParams) return null;
    return this.TreeFilterParams.treeTableDataField;
  }

  get LocalTreeDataField(): string {
    // this is the local data field that corresponds to the tree data field
    if (!this.TreeFilterParams) return null;
    return this.TreeFilterParams.localTreeDataField;
  }
  get TreeTableLocationField(): string {
    // this is the local data field that corresponds to the tree data field
    if (!this.TreeFilterParams) return null;
    return this.TreeFilterParams.treeTableLocationField;
  }

  get TreeTableCode(): string {
    // this is the tree table code defined in the dataset
    if (!this.TreeFilterParams) return null;
    return this.TreeFilterParams.treeTableCode;
  }

  get TreeDataTableCode(): string {
    // this is the tree node details table code defined in the dataset
    if (!this.TreeFilterParams) return null;
    return this.TreeFilterParams.treeDataTableCode;
  }

  // parentTableCode is used to form filter on link table
  private _parentTableCode: string;
  @Input() set parentTableCode(value: string) {
    this._parentTableCode = value;
    this.SetDataParameters();
  }
  get parentTableCode(): string {
    return this._parentTableCode;
  }

  // when specified, TreeLocation is used to filter data belonging to the
  // TreeNode and its children. Filtering by TreeLocation will only work
  // if AssetField property is supplied
  private _TreeLocation: string;
  @Input() set TreeLocation(value: string) {
    this._TreeLocation = value;
    // this.ExtractDataCall();
  }

  private _TreeLocationFinal: string = null;
  public get TreeLocationFinal(): string {
    if (this._TreeLocation) {
      this._TreeLocationFinal = this._TreeLocation;
    } else {
      if (!this.dataSet) {
        this._TreeLocationFinal = null;
      } else {
        if (!this.dataSet.currTreeNode) this._TreeLocationFinal = null;
        else this._TreeLocationFinal = this.dataSet.currTreeNode.loc;
      }
    }
    return this._TreeLocationFinal;
  }

  @Input() parentGrid: DataGridBComponent;

  // private _parentKeyValueOld: number;
  private _parentKeyValue: number = null;
  @Input() set parentKeyValue(value: number) {
    this._parentKeyValue = value;

    if (this.isFilteredByRecordType)
      this.moduleExchangeInfo.state.recordType = this._parentKeyValue;

    this.SetSubTableCode();

    // if (subTable) this.tableCodeSub = subTable;
    // console.log("\nthis.tableCodeSub: ",_parent,this.tableCodeSub);

    // this.ExtractDataCall();
  }
  get parentKeyValue(): number {
    return this._parentKeyValue;
  }

  private _keyValue: number = -1;
  set keyValue(value: number) {
    this._keyValue = value;
  }
  get keyValue(): number {
    return this._keyValue;
  }

  @Input() forwardLink: boolean;
  @Input() linkChildType: string;

  @Input() previewWidth: number = 0;
  @Input() previewHeight: number = 0;

  @Input() followTree: boolean = false;

  private _TreeFilterParams: ITreeFilterParams;
  @Input() set TreeFilterParams(value: ITreeFilterParams) {
    this._TreeFilterParams = value;
    this.SetDataParameters();
  }
  get TreeFilterParams(): ITreeFilterParams {
    return this._TreeFilterParams;
  }

  get isFilterTree(): boolean {
    return this.TreeFilterParams ? true : false;
  }

  get RecordTypeInfo(): {
    recordTypeOptions?: Array<any>;
    recordTypeField?: string;
    recordTypeGroupField?: string;
  } {
    let ret: any = null;
    if (this.dataSet) {
      const tbl = this.sourceTable;
      if (tbl) {
        const tblCfg: IRegularTableConfig = tbl.TableConfig;

        if (tblCfg) {
          const typeField: string = tblCfg.recordTypeField;
          const col: ColumnInfo = tbl.columns.find((c) => c.name == typeField);
          // console.log("\ntblCfg:",tblCfg, col,tbl);
          if (col) {
            ret = {
              recordTypeOptions: tbl.recordTypeOptions,
              recordTypeField: typeField,
            };
            const lkpGroup: string = col.props.lookupgroup;

            const lkpTable: string = col.props.lookuptable;
            if (lkpTable) {
              // record type lookup table is specified
              const tblLkp = this.dataSet.tables[lkpTable];
              if (tblLkp) {
                const lkpCfg: ILookupTableConfig = tblLkp.TableLookupConfig;
                if (lkpCfg.lookupGroupField) {
                  // record type group is defined
                  ret.recordTypeGroupField = lkpCfg.lookupGroupField;
                }
              }
            } // if(tblLkp) - end
          } // if(col) - end
        } // if(tblCfg - regular config) - end
      }
    }

    return ret;
  }

  private END_TIME: string = 'T23:59:59';
  private periodStartDate(value: string, periodType?: string): string {
    if (periodType == undefined) periodType = 'DATE';
    if (periodType == 'DATE') return value;
    else if (periodType == 'YEAR') return value + '-01-01';
    else if (periodType == 'MONTH') return value + '-01';
    else return value;
  }

  private periodEndDate(value: string, periodType?: string): string {
    if (periodType == undefined) periodType = 'DATE';
    if (periodType == 'DATE') return value + this.END_TIME;
    else if (periodType == 'YEAR') return value + '-12-31' + this.END_TIME;
    else if (periodType == 'MONTH') {
      // Expected value is YYYY-MM
      const moArr = value.split('-');
      const mos = this.dataSet.apiCommon.MONTHS(+moArr[0]);
      const mo = mos[+moArr[1] - 1];
      return value + '-' + mo.end + this.END_TIME;
    } else return value + this.END_TIME;
  }

  @Input() ExcludedIds: Array<number> = [];
  @Input() IncludedIds: Array<number>;
  @Input() set SelectedIds(value: Array<number>) {
    if (!this.grid) return;
    this.grid.SelectedIds = value;
  }

  public get RecordCount(): number {
    if (!this.reqInfo) return 0;
    return this.reqInfo.totalRecords ? this.reqInfo.totalRecords : 0;
  }

  public get LoadedCount(): number {
    if (!this.grid) return 0;
    if (!this.grid.sourceRows) return 0;
    return this.grid.sourceRows.length;
  }

  public get SelectedCount(): number {
    if (this.SelectMode) {
      if (!this.grid) return 0;
      return this.grid.SelectedCount;
    } else {
      return this._gridRow ? 1 : 0;
    }
  }

  get IncludedCount(): number {
    if (!this.IncludedIds) return 0;
    return this.IncludedIds.length;
  }

  get SelectedIds(): Array<number> {
    if (!this.grid) return undefined;
    return this.grid.SelectedIds;
  }

  get selectedRecords(): Array<any> {
    if (this.SelectMode) {
      if (!this.grid) return [];
      if (!this.grid.sourceRows) return [];
      const rows = this.grid.sourceRows;
      if (rows.length == 0) return [];

      const key = this.sourceTable.keyName;

      const ret: Array<any> = [];
      this.SelectedIds.forEach((id) => {
        const rec = rows.find((row) => row[key] == id);
        if (rec) ret.push(rec);
      });
      return ret;
    } else {
      if (!this.grid) return [];
      if (!this.grid.currentRow) return [];
      return [this.grid.currentRow];
    }
  }

  get selectedRecordStatus(): string {
    if (!this.grid) return '';
    return this.grid.selectedRecordStatus;
  }
  get fullTitle(): string {
    if (!this.title) return '';
    const sel: string = this.selectedRecordStatus;
    const count = this.RecordCount;
    const lCount = this.IncludedCount;
    const title = this.title
      .replace('{RECS}', count + ' item' + (count > 1 ? 's' : ''))
      .replace('{LINKED}', lCount + ' item' + (lCount ? 's' : ''))
      .replace(
        '{LIMIT}',
        this.maxItems != undefined ? String(this.maxItems) : ''
      );
    return `${title}${(sel.length ? ', ' : '') + sel}`;
    //title
  }

  get ReqParam(): RequestParams {
    // serves as base filter request parameter...
    // if column filtering is active, filter expression from this property
    // must be ANDED to the column filter expression

    let reqParam: RequestParams = new RequestParams();
    if (!this._reqInfo.pageNumber) this._reqInfo.pageNumber = 1;
    if (!this._reqInfo.pageSize)
      this._reqInfo.pageSize = this.DEFAULT_PAGE_SIZE;

    const pageNumber = this._reqInfo.pageNumber;
    const pageSize = this._reqInfo.pageSize;

    const opt: DataGridOption = this.options;

    const tbl = this.sourceTable;
    const keyName = tbl.keyName;
    const dataGroup: ColumnInfo = tbl.DataGroup;

    // const tblCfg: IRegularTableConfig = tbl.TableConfig;

    // const asset: ColumnInfo = tbl.AssetField;

    // ********************** set filter expressions ************************************

    opt.SubFilterClear();

    if (this.isTreeFiltering && !this.linkFilter)
      this.SetTreeFiltering(this.FilterSelectedFlag);

    if (this.FilterSelectedFlag) {
      // *********************** selection filtering overrides all filtering methods *********
      if (this.SelectedCount) {
        if (opt.WhereTree.length) opt.And();
        opt.In({ fieldName: keyName }, this.SelectedIds);
      }
      // if none is selected, filter to return empty dataset
      else opt.Equal({ fieldName: keyName }, -888);
    } else {
      // *********************** filter data using link tables *******************************
      if (this.linkFilter) {
        const linkCode =
          this.parentTableCode +
          (this.linkChildType ? '-' + this.linkChildType : '');
        if (this.forwardLink) {
          // parentKeyValue is used to filter on the first field of the link table
          opt.LeftLinkedTo(linkCode, this.parentKeyValue);
        } else {
          // parentKeyValue is used to filter on the second field of the link table
          opt.RightLinkedTo(linkCode, this.parentKeyValue);
        }
      }

      // *********************** filter using data group and group value *******************************
      if (dataGroup && this.parentKeyValue && !this.linkFilter) {
        // filter by data group field, applicable to data with type grouping
        // dataGroup field most of the time is the same as the recordTypeField configuration parameter
        // eg. ChemDB, Survey Data, etc
        //
        // console.log("\nopt.fromClauseCode: ",opt.fromClauseCode,", opt.WhereTree: ",opt.WhereTree);
        if (opt.WhereTree.length) opt.And();

        opt.Equal({ fieldName: dataGroup.name }, this.parentKeyValue);
      }

      // excluded id's are specified
      if (this.ExcludedIds.length) {
        if (opt.WhereTree.length) opt.And();
        opt.NotIn({ fieldName: keyName }, this.ExcludedIds);
      }

      if (this.IncludedIds != undefined) {
        if (opt.WhereTree.length) opt.And();
        if (this.IncludedIds.length)
          opt.In({ fieldName: keyName }, this.IncludedIds);
        else opt.Equal({ fieldName: keyName }, -888);
      }
    }

    // if column filtering flag is active
    if (this.activeFiltering) {
      // insert column filters here. before extracting where clause, form column filter expressions
      this.InsertColumnFilters();

      // Process columnn sort field(s)
      this.ProcessSortFields();
    }

    // ********************** set included fields ************************************
    reqParam.includedFields = opt.FieldList; // select
    // if (this.includeExtraFields) {
    //   let xtFlds = tblCfg.extraFields;
    //   // check specifig config for the current gridColumns
    //   reqParam.includedFields += '`' + xtFlds;
    // }
    if (this.extraFields) reqParam.includedFields += '`' + this.extraFields;

    // set from clause which includes table join parameters
    reqParam.code = opt.fromClauseCode; // from
    // if (this.includeExtraJoins) {
    //   let xtJoin = tblCfg.extraJoins;
    //   reqParam.code += xtJoin;
    // }
    if (this.extraJoins) reqParam.code += this.extraJoins;

    // set filter clause
    reqParam.filter = opt.whereClause; // where


    // AND external filter expression
    if (this.extFilterExpression) {
      reqParam.filter += (reqParam.filter ? "^" : "") + this.extFilterExpression
    }

    reqParam.sortFields = opt.orderByClause; // order by
    reqParam.fieldMap = opt.fieldMap; // field mapping

    reqParam.snapshot = true;
    reqParam.clearExisting = true;
    if (!this._forceNoFooter) {
      reqParam.pageNumber = pageNumber;
      reqParam.pageSize = pageSize;
    }

    return reqParam;
  }

  ProcessSortFields(): void {
    let sortFields: Array<IFieldDefParam> = [];

    const opt: DataGridOption = this.options;

    let withFilters: boolean = false;
    let initialColumn: string = '';

    const filteredColumns: Array<DataGridColumn> = [];

    // check if column filtering is applied in at least one grid column

    opt.visibleColumns.forEach((c) => {
      if (c.sortAsc) {
        this.dataSet.cl(['Sort by', c]);
        opt.OrderBy([{ fieldName: c.fieldName, sortDescending: false }]);
      } else if (c.sortDesc) {
        this.dataSet.cl(['Sort by', c]);
        opt.OrderBy([{ fieldName: c.fieldName, sortDescending: true }]);
      }
    });
  }

  get withFilterOrSort() {
    let ret: boolean = false;
    this.options.columns.forEach((c) => {
      if (ret) return;
      if (c.sortAsc || c.sortDesc) {
        ret = true;
        return;
      }
      if (!c.allowFilter) return;
      if (!c.filters) return;
      if (c.filters.length == 0) return;
      ret = true;
    });

    return ret;
  }

  private _ExcludedFilterColumn: DataGridColumn = null;
  InsertColumnFilters(): void {
    const opt: DataGridOption = this.options;

    let withFilters: boolean = false;
    let initialColumn: string = '';

    const filteredColumns: Array<DataGridColumn> = [];

    // check if column filtering is applied in at least one grid column
    opt.columns.forEach((c) => {
      // if filtering is not allowed for the column
      if (!c.allowFilter) return;

      // if filters is not defined, process next column
      if (!c.filters) return;

      // if filters does not contain any element, process next column
      if (c.filters.length == 0) return;

      // if column is to be excluded in filtering
      if (this._ExcludedFilterColumn)
        if (this._ExcludedFilterColumn.fieldKey == c.fieldKey) return;

      // passed all conditions, set initial field name and withFilters flag
      if (!withFilters) {
        withFilters = true;
        initialColumn = c.fieldName;
      }

      // add column to the filtered columns collection
      filteredColumns.push(c);
    });

    if (!withFilters) {
      // nothing to filter
      return;
    }

    // Iterate through filteredColumns
    filteredColumns.forEach((c) => {
      // to be used in determining value for fldParam
      let fld: DataColumn;

      // to be used as parameter when calling option.<filter> method
      let fldParam: IFieldDefParam;

      if (c.displayField)
        // if column has lookup displaField parameter set, filter value is based
        // on the displayField text and not the actual field value.
        // therefore, filtering must be made on the displayField.
        // find field definition within the datagrid option object.
        fld = opt.fields.find(
          (fl) => fl.fieldAlias == c.displayField && fl.tableAlias
        );

      const groupFilters: boolean = c.filters.length > 1;
      const isInitialColumn: boolean = initialColumn == c.fieldName;

      // insert logical AND operator on
      if (opt.WhereTree.length != 0) opt.And();
      if (groupFilters) opt.GroupStart();

      // iterate through column filters
      c.filters.forEach((f) => {
        // assign value to fldParam which will be used in actual option filter expression
        if (fld) {
          fldParam = {
            fieldName: fld.fieldName,
            tableAlias: fld.tableAlias,
          };
        } else {
          fldParam = f.fieldParam;
        }

        if (f.logicalAndGroupStart) opt.ANDS();
        else if (f.logicalAndGroupEnd) opt.ANDE();
        else if (f.logicalAnd) opt.And();
        else if (f.logicalOrGroupStart) opt.ORS();
        else if (f.logicalOrGroupEnd) opt.ORE();
        else if (f.logicalOr) opt.Or();
        else if (f.groupStart) opt.GroupStart();
        else if (f.groupEnd) opt.GroupEnd();
        else {
          // get filter type
          const dataType = f.fieldParam.filterDataType;
          const dataFormat = f.fieldParam.fieldFormat;
          const isDate = dataType == FilterDataType.DATE;

          // get raw values
          let v: any = isDate
            ? this.periodStartDate(f.value, dataFormat)
            : isNaN(f.value)
              ? f.value
              : +f.value;

          if (isDate) {
            v = this.periodStartDate(f.value, dataFormat);
          } else if (isNaN(f.value) && f.value) {
            v = f.value;
          } else if (f.value == null) {
            v = null;
          } else {
            v = +f.value;
          }

          const vEnd = isDate ? this.periodEndDate(f.value, dataFormat) : null;
          //
          const v1 = f.value1;
          const v2 = f.value2;
          const v2End = isDate ? v2 + this.END_TIME : null;

          console.log('\nf: ', f, ', v:', v, ', +f.value:', +f.value);

          // peroform actual filter expression building
          switch (f.operator) {
            case 'in':
              opt.In(fldParam, f.values);
              break;
            case 'eq':
              if (isDate) opt.Between(fldParam, v, vEnd);
              else opt.Equal(fldParam, v);
              break;
            case 'neq':
              if (isDate) opt.NotBetween(fldParam, v, vEnd);
              else opt.NotEqual(fldParam, v);
              break;
            case 'lt':
              opt.LessThan(fldParam, v);
              break;
            case 'lte':
              opt.LessThanOrEqual(fldParam, isDate ? vEnd : v);
              break;
            case 'gt':
              opt.LessThan(fldParam, isDate ? vEnd : v);
              break;
            case 'gte':
              opt.LessThanOrEqual(fldParam, v);
              break;
            case 'bgw': // begins with
              opt.Like(fldParam, `${f.value}%%`);
              break;
            case 'enw': // ends with
              opt.Like(fldParam, `%%${f.value}`);
              break;
            case 'lk': // like / contains
              opt.Like(fldParam, `%%${f.value}%%`);
              break;
            case 'btw': // between
              opt.Between(fldParam, v1, isDate ? v2End : v2);
              break;
            case 'nbtw': // not between
              opt.NotBetween(fldParam, v1, isDate ? v2End : v2);
              break;
            default:
          }
        }
      }); // end of column filters iteration

      // filter group termination!
      if (groupFilters) opt.GroupEnd();
    }); // end of filteredColumns.forEach ...
  }


  //Neo 20210413
  CampEvtClick(e: any) {
    this.campEvtClick.emit({ e: e, sender: this });
  }

  private BuildCustomFilterList(
    column: DataGridColumn,
    dataType: number,
    onSuccess?: Function
  ): void {
    // This method produces array of strings that will be used as source in the
    // selection of actual column values as filter value parameter(s)

    // check if data type is date
    const isDate: boolean = dataType == FilterDataType.DATE;
    const lkpParams: ILookupParams = column.lookupParams;
    let toggleValues: Array<any> = null;

    // if no lookup parameters specified, use the fieldname as the display field
    let includedField: string = '';
    if (!lkpParams) {
      includedField = column.fieldName;
    } else {
      if (
        lkpParams.inlineLookupTableAlias &&
        lkpParams.inlineLookupTableField
      ) {
        includedField = `${lkpParams.inlineLookupTableAlias}.${lkpParams.inlineLookupTableField}`;
      } else {
        console.log('\nlkpParams:', lkpParams, ', column:', column);
        includedField = column.fieldName;
        if (lkpParams.toggleDisplay) toggleValues = lkpParams.toggleDisplay;
      }
    }
    // let includedField: string = !lkpParams
    //   ? column.fieldName
    //   : `${lkpParams.inlineLookupTableAlias}.${lkpParams.inlineLookupTableField}`;

    const params: RequestParams = this.ReqParam;
    params.includedFields = includedField + (isDate ? '@^^DATE' : '');
    params.snapshot = true;
    params.distinct = true;
    params.pageSize = 1000000;
    params.pageNumber = 1;

    console.log(
      '\nparams.includedFields: ',
      isDate,
      FilterDataType.DATE,
      dataType,
      params.includedFields
    );

    // call get method..

    this.dataSet.Get([params], {
      onSuccess: (data) => {
        console.log(
          '\nBuildCustomFilterList data: ',
          data,
          ', toggleValues: ',
          toggleValues
        );
        if (data.raw.length) {
          const rows = data.raw[0].recordsList;
          let tmpList: Array<string> = [];
          // if recordlist is not null
          if (rows) {
            rows.forEach((row) => {
              let rowVal: any = row[0];
              if (toggleValues) {
                const optVal = toggleValues.find((tgl) => tgl.value == rowVal);
                if (optVal) rowVal = optVal.display;
              }
              tmpList.push(rowVal);
            });

            tmpList.sort(function (a, b) {
              if (a > b) {
                return -1;
              }
              if (b > a) {
                return 1;
              }
              return 0;
            });
          }
          //this._customFilterList = tmpList;
          // if (onSuccess) onSuccess(this.customFilterList);
          if (onSuccess) onSuccess(tmpList);
        } else {
          console.log('No return object found!');
        }
        //this.suppressPendingRequestFlag = false;
      },
      onError: (err) => {
        console.log('Error', err);
        // this.suppressPendingRequestFlag = false;
      },
    });
  }

  public ApplyFilter(e: {
    column: DataGridColumn;
    option: DataGridOption;
    clear?: boolean;
    saveOnly?: boolean;
    exclCurr?: boolean;
    dataType?: number;
    onBuildList?: Function;
  }) {
    let {
      column,
      option,
      clear,
      saveOnly,
      exclCurr,
      dataType,
      onBuildList,
    } = e;
    if (!clear) clear = false;
    if (!saveOnly) saveOnly = false;
    if (!exclCurr) exclCurr = false;
    if (!dataType) dataType = FilterDataType.TEXT;

    // set current column as excluded column when the exclCurr flag is set
    if (exclCurr) {
      this._ExcludedFilterColumn = column;
      this.BuildCustomFilterList(column, dataType, onBuildList);
    } else {
      this._ExcludedFilterColumn = null;
    }

    if (!saveOnly) this.RefreshClick(null);

    if (this._ReportMode) this.reportSelected(this.ReportDetails)
  }

  SetGridColumnDef(gridColumn: string) {

    // Define datagir column found in table configuration's  gridColumns or customGridColumns
    let opt: DataGridOption = this.options;
    let colDef: IDataGridColumn = {};

    const tbl = this.sourceTable;
    const assetField: ColumnInfo = tbl.AssetField;

    const defArr = gridColumn.split(SQLJoinChars.TABLE_CODE_SEPARATOR);
    const fldAliasArr = defArr[0].split('@');
    const fldNameArr = fldAliasArr[0].split('.');
    const fieldName = fldNameArr[fldNameArr.length - 1];

    const optArr = defArr.length > 1 ? defArr[1].split(';') : [];

    const dateFormat = this.dataSet.apiCommon.GetProperty(optArr, 'dfmt');
    const fieldMap = this.dataSet.apiCommon.GetProperty(optArr, 'map');
    const cap = this.dataSet.apiCommon.GetProperty(optArr, 'cap');
    const width = this.dataSet.apiCommon.GetProperty(optArr, 'wd');
    const minWidth = this.dataSet.apiCommon.GetProperty(optArr, 'mnw');
    const maxWidth = this.dataSet.apiCommon.GetProperty(optArr, 'mxw');
    const mtxFields = this.dataSet.apiCommon.GetProperty(optArr, 'mtx');
    const leftJoin = this.dataSet.apiCommon.GetProperty(optArr, 'left');

    const noFilter: boolean = optArr.indexOf('nofilt') != -1;
    const useCode: boolean = optArr.indexOf('code') != -1;

    colDef.fieldName = fieldName;
    colDef.caption = cap;
    colDef.allowFilter = !noFilter;

    if (fldAliasArr.length >= 2) colDef.fieldAlias = fldAliasArr[1];
    if (fldNameArr.length >= 2) colDef.tableAlias = fldNameArr[0];

    if (width) {
      colDef.minWidth = +width;
      colDef.maxWidth = +width;
    } else {
      if (minWidth) colDef.minWidth = +minWidth;
      if (maxWidth)
        colDef.maxWidth = Math.max(+maxWidth, minWidth ? +minWidth : +maxWidth);
    }

    if (optArr.indexOf('center') != -1) colDef.align = 'center';
    if (optArr.indexOf('right') != -1) colDef.align = 'right';

    let col: ColumnInfo;
    if (fieldName.startsWith('@')) {
      // field alias is specified instead of table fieldname
      // still under development as of 2021/02/01, ...
      colDef.fieldName = undefined;
      colDef.fieldAlias = fieldName.substring(1);
      colDef.fieldKey = colDef.fieldAlias;
      if (mtxFields) {
        // matrix type fields
        const requiredFields = mtxFields.split(','); // get Severity and Likelihood fieldname components
        colDef.matrixSeverity = requiredFields[0];
        colDef.matrixLikelihood = requiredFields[1];
        colDef.requiredFields = requiredFields;
        colDef.value = `M{${colDef.matrixSeverity}}{${colDef.matrixSeverity}}`;
        colDef.colorParams = null;
        colDef.displayFormat = '';
        colDef.filterType = FilterDataType.MATRIX;
        colDef.lookupParams = {
          lookupSource: null,
          lookupDisplayField: 'code',
          lookupValueField: 'object',
        };

        /**
 *
 *       value: 'M{AN_RISK_RANK_SEVERITY}{AN_RISK_RANK_LIKELIHOOD}',
      width: 40,
      align: 'center',
      caption: 'Risk',
      colorParams: null,
      lookupParams: {
        lookupSource: null, // this will later be replaced with this.ds.riskMatrixData.mtx onSuccess of lookup retreival
        lookupDisplayField: 'code',
        lookupValueField: 'object',
      },
      displayFormat: '',
      requiredFields: ['AN_RISK_RANK_SEVERITY', 'AN_RISK_RANK_LIKELIHOOD'],
 *
 */
      }

      // opt.AddColumn(colDef);
      // console.log("FROM CONFIG COLDEF:",colDef);
      return;
    } else {
      col = tbl.columns.find((c) => c.name == fieldName);

      if (!col) {
        // column is not one of the local table columns. must be from a linked
        // table and data will be available in the row's XTRA property
        // AddColumn without creating field element....
        colDef.displayField = this.dataSet.apiCommon.GetProperty(
          optArr,
          'disp'
        );

        // if table alias is specified, field will be taken from
        // the foreign table and therefore noFieldCreate flag is
        // set to false.
        opt.AddColumn(colDef, colDef.tableAlias ? false : true);

        // if (fieldName == 'LKP_MEMO_1')
        //   console.log('MEMO FIELD!!!: ', colDef, ', included: ', opt.FieldList);
        return;
      }
    }

    const isAssetField: boolean = assetField
      ? assetField.name == fieldName
      : false;

    const innerJoin = this.dataSet.apiCommon.GetProperty(optArr, 'inner');

    const lkpGroup = col.props.lookupgroup;
    const lkpTable = col.props.lookuptable;
    const lkpSwitch = col.props.lookupswitch;
    const lkpUseText: boolean = col.props.useLookupText ? true : false;

    // standard lookup aliases
    const lkpTblAlias: string = 'TBL_' + fieldName; // table alias
    const lkpTextAlias: string = 'TEXT_' + fieldName; // text field alias
    const lkpCodeAlias: string = 'CODE_' + fieldName; // code field alias

    let lkpPrm: ILookupParams = {}; // standard lookup params object

    // set column field mapping
    const colMap: string = col.props.map;
    if (colMap) colDef.fieldMap = colMap;

    // setup lookup source
    if (!isNaN(lkpGroup)) {
      // if lookup is from the common lookup talbe
      const lkpTbl = this.dataSet.CommonLookupTable;

      colDef.lookupParams = lkpPrm;
      colDef.displayFieldSub = '';
      colDef.lookupParams.useLookupCode = useCode;

      lkpPrm.inlineLookupFieldAlias = lkpTextAlias;
      lkpPrm.inlineLookupTableAlias = lkpTblAlias;
      lkpPrm.inlineLookupTableField = lkpTbl.LookupTextField.name;

      lkpPrm.inlineLookupText = lkpTbl.LookupTextField
        ? lkpTbl.LookupTextField.name
        : null;
      lkpPrm.inlineLookupCode = lkpTbl.LookupCodeField
        ? lkpTbl.LookupCodeField.name
        : null;

      let dspFldIdx: number = 1;
      if (lkpPrm.inlineLookupCode) {
        colDef.displayFieldSub = lkpCodeAlias;
        lkpPrm.inlineCodeIdx = dspFldIdx;
        dspFldIdx++;
      }

      // if forecolor and back color is part of the lookup
      if (optArr.indexOf('color') != -1) {
        const lkpForeAlias: string = 'FORE_' + fieldName;
        const lkpBackAlias: string = 'BACK_' + fieldName;

        if (lkpTbl.LookupForeField) {
          lkpPrm.inlineLookupFore = lkpTbl.LookupForeField.name;
          colDef.displayFieldSub +=
            (colDef.displayFieldSub ? ',' : '') + lkpForeAlias;
          lkpPrm.inlineForeIdx = dspFldIdx;
          dspFldIdx++;
        } else {
          lkpPrm.inlineLookupFore = null;
        }

        if (lkpTbl.LookupBackField) {
          lkpPrm.inlineLookupBack = lkpTbl.LookupBackField.name;
          colDef.displayFieldSub +=
            (colDef.displayFieldSub ? ',' : '') + lkpBackAlias;

          lkpPrm.inlineBackIdx = dspFldIdx;
          // dspFldIdx++;
        } else {
          lkpPrm.inlineLookupBack = null;
        }
      }

      // set join parameters
      let frmLnk: IFromClauseLink = {
        code: lkpTbl.tableCode,
        alias: lkpTblAlias,
        localField: fieldName,
      };

      // set left join to common lookup table
      opt.LeftJoin(frmLnk);
    } else if (mtxFields) {
      // matrix type column
      console.log('coldef:', colDef);
      return;
    } else if (isAssetField) {
      // if lookup is taken from the nodes table
      const tblAsset = this.dataSet.NodesTable;

      lkpPrm.inlineLookupFieldAlias = lkpTextAlias;
      // lkpPrm.inlineLookupTableAlias = lkpTblAlias;
      lkpPrm.inlineLookupTableAlias = tblAsset.tableCode;
      lkpPrm.inlineLookupTableField = tblAsset.LookupTextField.name;
      colDef.lookupParams = lkpPrm;
      //
    } else if (lkpTable && !lkpUseText) {
      // if lookup table code is specified
      const lkpTbl = this.dataSet.tables[lkpTable];

      lkpPrm.inlineLookupFieldAlias = lkpTextAlias;
      // lkpPrm.inlineLookupTableAlias = lkpTblAlias;
      // lkpPrm.inlineLookupTableAlias = lkpTbl.tableCode;
      lkpPrm.inlineLookupTableAlias = 'TBL_' + fieldName;
      lkpPrm.inlineLookupTableField = lkpTbl.LookupTextField.name;

      colDef.lookupParams = lkpPrm;

      // set join parameters
      let frmLnk: IFromClauseLink = {
        code: lkpTbl.tableCode,
        alias: lkpPrm.inlineLookupTableAlias, // table alias is same as table code
        localField: fieldName,
      };

      // set left join to common lookup table
      opt.LeftJoin(frmLnk);
    } else if (lkpSwitch && col.lookupSwitch) {
      // switch
      // this.dataSet.cl([
      //   'lookupswitch',
      //   col.lookupSwitch,
      //   'lkpSwitch',
      //   lkpSwitch,
      // ]);
      // lookupParams: { toggleDisplay: this.ds.toggleYesNoNA },
      colDef.lookupParams = { toggleDisplay: col.lookupSwitch };
    }

    if (col.type == 'Date')
      colDef.dateFormat = dateFormat ? dateFormat : 'default';

    if (leftJoin) {
    }

    opt.AddColumn(colDef);

    //GetPropertyStr
  }

  SetDataParameters() {
    let opt: DataGridOption = this.options;

    if (this.tableCode) {
      if (!opt.code) opt.From(this.tableCode);

      if (opt.code && this.dataSet) {
        const tblMain = this.sourceTable;
        if (tblMain && this._deletedField == undefined) {
          // set main table deleted field name
          const delCol = tblMain.columns.find((f) => f.isDeletedField);
          this._deletedField = delCol ? delCol.name : null;
        }
      }

      if (this.dataSet && !opt.keyColumnName) {
        // set option's key field based on table code
        const tbl = this.sourceTable;
        if (tbl) {
          opt.SetKeyColumnName(tbl.keyName);
          if (!opt.columns.find((c) => c.fieldKey == tbl.keyName)) {
            // add table key field as one of the columns to be extracted
            opt.AddColumn({
              caption: 'ID',
              align: 'center',
              fieldName: tbl.keyName,
              width: 50,
              allowFilter: false,
            });
          }
        }
      }
    }
    if (this.dataSet) {
    }
  }

  SetTreeFiltering(treeTypeOnly?: boolean): void {
    // filter on tree id/(node group)
    const opt: DataGridOption = this.options;
    const treCfg: ITreeTableConfig = this.dataSet.TreeTableConfig;
    if (!treeTypeOnly) treeTypeOnly = false;

    opt.Equal(
      // tree configuration groupField filtering used tree data type as group filter value
      { fieldName: treCfg.groupField, tableAlias: 'tre' },
      this.dataSet.currentTreeId
    );
    if (this.CurrentTreeNode && !treeTypeOnly) {
      // filter by current tree node location
      opt
        .And()
        .ORS()
        .Equal(
          // data asset location equal to the current tree location
          { fieldName: treCfg.locationField },
          this.CurrentTreeNode.loc
        )
        .Like(
          // data asset location starts with current tree location
          { fieldName: treCfg.locationField },
          `${this.CurrentTreeNode.loc}%%`
        )
        .ORE();
    }
  }

  SetSubTableCode(): void {
    if (this.dataSet && this.tableCode) {
      // const tbl = this.dataSet.tables[this.tableCode];
      // const { subTable, dataGroup } = tbl.clientConfig;
      // if (subTable) {
      //   if (typeof subTable == 'object' && dataGroup) {
      //     // if object type and data group field is defined, set subTable[parentKeyValue] as tableCodeSub
      //     this.tableCodeSub = subTable[this._parentKeyValue];
      //   } else {
      //     this.tableCodeSub = subTable;
      //   }
      // } else {
      //   this.tableCodeSub = '';
      // }
    }
  }

  private _ExtractDataTimeout: any;
  ExtractDataCall(args?: {
    message?: string;
    newKey?: number;
    onSuccess?: Function;
    onError?: Function;
    noMask?: boolean;
  }) {
    //this._isLoadingRecords = true;
    if (args) if (args.noMask == undefined) args.noMask = false;
    if (this._ExtractDataTimeout) {
      clearTimeout(this._ExtractDataTimeout);
      this._ExtractDataTimeout = null;
    }
    this._ExtractDataTimeout = setTimeout(() => this.ExtractData(args), 30);
  }

  ExtractData(args?: {
    message?: string;
    newKey?: number;
    onSuccess?: Function;
    onError?: Function;
    noMask?: boolean;
  }) {


    // if(this.sourceRowsRawValue){
    //   console.log("**** this.sourceRowsRawValue:",this.sourceRowsRawValue, this.sourceRows)
    //   this.grid.Refresh();
    //   return;
    // }

    const opt = this.options;
    if (!args) args = {};
    if (!args.noMask) args.noMask = false;

    const { noMask, message, newKey, onSuccess, onError } = args;
    let reqParam: RequestParams = this.ReqParam;

    if (!noMask) this.ShowMask(message);

    const subsb: Subscription = this.dataSet.Get([reqParam], {
      onSuccess: (data) => {
        // console.log('\nDataGrid-B ExtractData:', data);
        // use integrated lookup to display values on grid
        this.grid.sourceLookups = data.processed.lookups[0];
        // set sourceRows to the first element (Array of row data type) in the processed data
        this.sourceRows = data.processed.data[0];

        // refresh grid
        this.Refresh((args) => {
          if (this.sourceRows.length && newKey != -1) {
            const tbl = this.sourceRows[0].parentTable;
            if (tbl) {
              // set current data row;
              const currRow = this.sourceRows.find(
                (r) => r[tbl.keyName] == newKey
              );

              // set grid current row pointer if row with newKey exists
              if (currRow) this.grid.RowClick(currRow, this.noInitFocus);
            }
          }

          if (this.sourceRows.length == 0) {
            this._gridRow = null;
            const detailsForm = this.moduleExchangeInfo
              ? this.moduleExchangeInfo.detailsObject
                ? this.moduleExchangeInfo.detailsObject.form
                : null
              : null;
            if (detailsForm) detailsForm.ClearForm();
          }
        });
        // this.Refresh((args) => {
        //   // callback function after grid refresh
        // if(newKey != undefined)
        // });

        // call component host event if defined.
        this.DataExtracted(data);
        // reset timeout reference
        this._ExtractDataTimeout = null;

        // call host success feedback function
        if (onSuccess) onSuccess(data);

        // console.log('\nPageInfo: ', this.reqInfo);
        subsb.unsubscribe();
      },
      onError: (err) => {
        console.log('\nError:', err);
        if (onError) onError(err);
        subsb.unsubscribe();
      },
    });
  }

  differ: KeyValueDiffer<string, any>;
  constructor(
    public dialog: MatDialog,
    private differs: KeyValueDiffers,
    private appMainService: AppMainServiceService
  ) {
    this.differ = this.differs.find({}).create();
  }
  private ctr: number = 0;
  ngDoCheck() {
    const change = this.differ.diff(this);
    let process: boolean = false;
    if (change) {
      change.forEachChangedItem((item) => {
        if (
          (this.isFilterTree && item.key == '_TreeLocationFinal') ||
          item.key == '_parentKeyValue'
        ) {
          process = true;
          this.OnParentKeyValueChanged();
        }

        if (item.key == '_formObject') this.SetFormGroupParams();
        if (item.key == '_form') this.SetFormParams();
        if (item.key == '_gridRow') this.OnRowChange();
        if (item.key == '_reqInfo') this.OnRecordInfoChanged();
        if (item.key == '_CurrentTreeNode') this.OnTreeNodeChanged();
      });

      // console.log("\nprocess && !this._ExtractDataTimeout:",process && !this._ExtractDataTimeout)
      // if (process && !this._ExtractDataTimeout) {
      //   this.ctr++;
      //   this.ExtractDataCall();
      // }
    }
  }

  SetFormParams(): void {
    // console.log('****** SET PARAMTERS OF this.formObject:', this.form);
    this.form.TableCode = this.tableCode;
    this.form.TableCodeSub = this.tableCodeSub;
    this.form.DataSet = this.dataSet;
  }

  OnRowChange(): void {
    let newKey: number = -1;
    if (this._gridRow && this.form) {
      const tbl = this.form.sourceTable;
      if (tbl) {
        // const keyField = tbl.keyName;
        // if (keyField) newKey = this._gridRow[keyField];
        newKey = this._gridRow.keyVal;
      }
    }
    if (newKey != this.keyValue) this.keyValue = newKey;

    // console.log(`\nROW Changed!!! (${this.title})`, this._gridRow, 'newKey:', newKey);
    // if (this._gridRow && this.form) this.keyValue = -1;
    //   const tbl = this.form.sourceTable;
    // }
  }

  SetFormGroupParams(): void { }

  ngAfterViewInit(): void {
    if (!this._options) return;
    // call ShowColumns with all field displayed if it hasn't been called from the parent component yet
    if (!this.options.ShowColumnsCalled) {
      // this line fixes issue of having a data grid rendered half way
      this.resetColumnWidths();

      const opt = this.options;
      opt.ShowColumns().HideColumns([opt.keyColumnName]);


    }

    // this.ExtractDataCall();

    setTimeout(() => {
      if (this.form) {
      } else {
        // console.log('\nNO DETAILS FORM FOUND!!!');
      }

      // putting the next two lines inside this setTimout block
      // supresses rendering error when grid details resizing is made
      this._ready = true;
      this.handleResize(null);
    }, 1);
  }

  // public get state(): any {
  //   if (!this.parent) return null;
  //   return this.parent.state;
  // }

  public maskMessage: string = 'Loading. Please wait..';

  private _options: DataGridOption = null;
  public get options(): DataGridOption {
    if (!this._options) {
      // initialize data grid options
      let opt: DataGridOption = new DataGridOption([]);

      opt
        .SetRowHeaderHeight(this.RowHeaderHeight)
        .SetRowHeaderWidth(this.RowHeaderWidth)
        .RowHeight(this.RowHeight);

      if (this.noFooter) {
        opt.NoFooter();
      } else {
        opt.WithFooter();
      }

      this._options = opt;
    }

    return this._options;
  }

  public get dataGrid(): DataGridComponent {
    return this.grid;
  }

  resetColumnWidths() {
    setTimeout(() => this.grid.resetColumnWidths(), 10);
  }

  Refresh(onComplete?: Function) {
    setTimeout(() => this.grid.Refresh(false, onComplete), 50);
  }

  OpenManagement() {
    console.log('Invoke management here!!!!');
  }

  OpenPopup(
    width?: number,
    height?: number,
    disableClose?: boolean,
    data?: {}
  ): Observable<any> {
    if (!width) width = 300;
    if (!height) height = 200;
    if (!disableClose) disableClose = true;

    if (!data) data = {};
    let ref: MatDialogRef<DataGridBMgtComponent, any>;
    data['ref'] = ref;

    ref = this.dialog.open(DataGridBMgtComponent, {
      minWidth: `${width}px`,
      minHeight: `${height}px`,
      disableClose: disableClose,
      data: data,
    });

    return ref.afterClosed();
  }

  EmptyObject(obj: any): boolean {
    if (!this.dataSet) return true;
    return this.dataSet.apiCommon.EmptyObject(obj);
  }

  OpenSnackbar(args: {
    message: string;
    action?: string;
    duration?: number;
  }): void {
    if (!this.dataSet) return;
    this.dataSet.openSnackBar(args.message, args.action, args.duration);
  }

  ManageGrid(event: any) {
    const args: any = { e: event, abort: false, sender: this };
    this.manageClick.emit(args);
    if (args.abort) return;

    if (this.EmptyObject(this.gridManagementData)) {
      this.OpenSnackbar({
        message: 'Data management configuration not set.',
        action: 'x',
        duration: 3000,
      });
      return;
    }

    this.OpenPopup(950, 650, false, {
      parent: this,

      // Dialog title
      title: `${this.title ? this.title : 'List'}`,
      // dialog title icon
      icon: 'fa fa-link',
      // dialog action buttons
      buttons: [
        {
          label: 'Cancel',
          toolTip: 'Ignore changes and close',
          value: 'cancel',
          class: 'btn btn-sm btn-secondary',
        },
        {
          label: 'Reset',
          toolTip: 'Revert back to original setting',
          value: 'reset',
          class: 'btn btn-sm btn-secondary',
        },
        {
          label: 'Accept',
          toolTip: 'Accept new grid column setting',
          value: 'accept',
          class: 'btn btn-sm btn-warning',
        },
      ],
      gridManagementData: this.gridManagementData,
    }).subscribe((result) => {
      if (!result) return;
      if (result.mode == 'accept') {
        // accept mode result comes with fields return parameter
        this.AcceptChanges(result.fields);
      }
    });
  }

  private _gridRow: any = null;
  RowClick(e: any) {
    this.SetModuleExchangeData(e);
    this.rowClick.emit({ data: e, sender: this });

  }

  get nextActiveRow(): any {
    if (!this.sourceRows) return null;
    if (this.sourceRows.length < 1) return null;

    if (this._gridRow) {
      const tbl = this._gridRow.parentTable;
      const key = tbl.keyName;
      const idx = this.sourceRows.findIndex(
        (r) => r[key] == this._gridRow[key]
      );

      if (idx == -1) {
        return this.sourceRows[0];
      } else if (idx == this.sourceRows.length - 1) {
        return this.sourceRows[this.sourceRows.length - 2];
      } else {
        return this.sourceRows[idx + 1];
      }
    }

    return null;
  }

  SetModuleExchangeData(e: any) {
    this._gridRow = e;
    const tbl = e.parentTable;
    const tblCfg: IRegularTableConfig = tbl ? tbl.TableConfig : null;
    const recordType = this._parentKeyValue
      ? this._parentKeyValue
      : tblCfg
        ? e[tblCfg.recordTypeField]
        : null;

    if (this.options.keyColumnName) {
      this.keyValue = e[this.options.keyColumnName];

      if (this.moduleExchangeInfo) {
        if (this.moduleExchangeInfo.detailsObject) {
          // assign property to detailsObject
          this.moduleExchangeInfo.detailsObject.dataKeyValue = this.keyValue;

          // assign property to state object
          this.moduleExchangeInfo.state.dataRow = this._gridRow;
          this.moduleExchangeInfo.state.dataKeyValue = this.keyValue;

          // set record type only if grid is not filtered by record type!
          if (!this.isFilteredByRecordType)
            this.moduleExchangeInfo.state.recordType = recordType;
        }
      }
    } else {
      this.keyValue = -1;
    }
  }

  OnRecordInfoChanged() {
    // console.log("\n@@@@@ #### OnRecordInfoChanged ...")
  }

  OnTreeNodeChanged() {
    // this triggers initial loading of reacords when the component is initialized
    this._reqInfo.pageNumber = 1;
    this.ExtractDataCall();
    // setTimeout(()=>{this.ExtractDataCall(),1000});
    if (this._ReportMode) this.reportSelected(this.ReportDetails)
  }

  OnParentKeyValueChanged() {
    this.ExtractDataCall({ noMask: this.noMaskOnInit });
    // set
    if (!this.linkFilter) {
      // data group type is changed through the parentKeyValue property
    } else {
      // linked records where parent key is parentKeyValue
    }
  }

  DataExtracted(e: any) {
    const raw = e.raw[0];
    if (raw) {
      const returnParams = raw.returnDataParams;
      if (returnParams) {
        // this._reqInfo.totalPages = returnParams.totalPages;
        this._reqInfo.totalPages = returnParams.totalPages;
        this._reqInfo.totalRecords = returnParams.totalRecords_B
          ? returnParams.totalRecords_B
          : 0;

        const opt: DataGridOption = this.options;
        if (this.noFooter) {
          opt.NoFooter();
        } else {
          opt.WithFooter();
        }
      }
    }

    if (this.sourceRows.length) {
      this.grid.currentRow = this.sourceRows[0];
    } else {
      this.grid.currentRow = null;
    }

    // this.options.noFooter = true;
    this.options.noFooter = this._forceNoFooter ? true : this.noFooter;
    //this._forceNoFooter

    this.dataExtracted.emit({ data: e, sender: this });

    setTimeout(() => {
      //resetColumnWidths
      this.handleResize(null);
      this.resetColumnWidths();
      //setTimeout(() => this.grid.handleResize(null), 1000);
    }, 50);

    this.HideMask();
  }

  get detCurrentRow(): any {
    if (!this.moduleExchangeInfo) return null;
    if (!this.moduleExchangeInfo.detailsObject) return null;
    if (!this.moduleExchangeInfo.detailsObject.form) return null;
    return this.moduleExchangeInfo.detailsObject.form.formRow;
  }

  get RecordTypeSelectDefault(): number {
    const rti = this.RecordTypeInfo;

    if (!rti) return -1;

    let defVal: number = -1;

    const opts = rti.recordTypeOptions;

    if (this.detCurrentRow) {
      defVal = this.detCurrentRow[rti.recordTypeField];
    } else {
      if (this.isFilteredByRecordType) defVal = this._parentKeyValue;
    }

    if (defVal != -1) {
      const optItem = opts.find((o) => o.key == defVal);
      if (!optItem) defVal = -1;
    }

    return defVal;
  }

  get sourceTable(): any {
    if (!this.dataSet) return null;
    return this.dataSet.tables[this.tableCode];
  }

  get sourceTableConfig(): IRegularTableConfig {
    const tbl = this.sourceTable;
    if (!tbl) return null;
    return tbl.TableConfig;
  }

  OpenRecordTypeSelect(): Observable<any> {
    const tbl = this.sourceTable;
    const ref = this.dialog.open(DetailsPopup, {
      minWidth: '300px',
      minHeight: '160px',
      disableClose: false,
      data: {
        // data belonging to popup
        component: {
          // params of popup component
          component: RecordTypeSelectComponent,
          data: {
            hostObject: this,
            defaultValue: this.RecordTypeSelectDefault,
            form: new FormGroup({}),
            tableConfig: tbl.TableConfig,
            recordTypeOptions: tbl.recordTypeOptions,
            moduleExchangeInfo: this.moduleExchangeInfo,
          },
        },
        title: 'Select record type',
        buttons: this.dataSet.btnCancelAccept,
        icon: 'fa fa-check',
        buttonClick: this.RecordTypeSelectButtonClick,
      },
    });

    return ref.afterClosed();
  }

  RecordTypeSelectButtonClick(e: { button: IPopupButton; sender: any }) {
    console.log('\nRecordTypeSelectButtonClick: ', e);
    const formObj = e.sender.data.component.data.form;
    const ref = e.sender.dialogRef;
    if (e.button.value == 'cancel') {
      ref.close({ value: e.button.value, sender: e.sender });
    } else {
      if (!formObj.value.recordType || formObj.value.recordType == -1) {
        formObj.patchValue({ errorMessage: 'Invalid type selection!' });
      } else {
        ref.close({ value: 'accept', sender: e.sender });
      }
    }
  }

  OpenDetails(mode: string, defaultValues?: any): Observable<any> {
    if (this.moduleExchangeInfo) {
      const detailsObject = this.moduleExchangeInfo.detailsObject;

      if (detailsObject) {
        const detailsComponent: Type<any> = detailsObject.constructor;
        const isEdit = mode == 'edit';

        const args = {
          detailsItem: {
            // params of popup component
            component: detailsComponent,
            data: {
              defaultValues: defaultValues,
              hostObject: this,
              DetailsForm: detailsObject.form, // ! do not remove, this will be used when poppping up details
              AccessMode: mode,
              title: isEdit ? detailsObject.titleEdit : detailsObject.titleNew,
              moduleExchangeInfo: this.moduleExchangeInfo,
            },
          },

          // params of DetailsPopup
          width: detailsObject.popWidth,
          height: detailsObject.popHeight,

          icon: isEdit ? detailsObject.iconEdit : detailsObject.iconNew,
          title: isEdit ? detailsObject.titleEdit : detailsObject.titleNew,
          buttons: detailsObject.popButtons,
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
            buttonClick: this.DetailsButtonClick,
          },
        });

        return ref.afterClosed();
      }
    } else {
      return null;
    }
  }

  Delete(): Observable<any> {
    const frm: AppFormAComponent = this.moduleExchangeInfo.detailsObject.form;
    // console.log("\nThis.form",this.moduleExchangeInfo.detailsObject.form)
    if (!frm) return null;

    const prompParams: any = { form: frm };

    if (this.SelectedCount) {
      // if record selected on either SelectMode or otherwise
      const tbl = this._gridRow.parentTable;
      const delCol: ColumnInfo = tbl.columns.find(
        (c: ColumnInfo) => c.isDeletedField
      );
      if (delCol) {
        prompParams.width = this.promptWidths.delete
          ? this.promptWidths.delete
          : 550;
        prompParams.title = frm.prompts.deleteWithRecord.title;
        // prompParams.message = frm.prompts.deleteWithRecord.message;
        prompParams.message = this.deletePrompt;
        prompParams.icon = frm.prompts.deleteWithRecord.icon;
        prompParams.icon_color = frm.prompts.deleteWithRecord.icon_color;
        prompParams.buttons = frm.prompts.deleteWithRecord.buttons;
        prompParams.action = 'delete_with_record';
      } else {
        prompParams.title = 'Table configuration error';
        prompParams.message =
          "Delete flag field not defined in table's configuration!";
        prompParams.icon = 'fa fa-info-circle';
        prompParams.width = 450;
        prompParams.icon_color = '#17a2b8';
        prompParams.buttons = frm.prompts.deleteNoRecord.buttons;
        prompParams.action = 'delete_no_delete_field';
      }
    } else {
      prompParams.title = frm.prompts.deleteNoRecord.title;
      // prompParams.message = frm.prompts.deleteNoRecord.message;
      prompParams.message = this.SelectMode
        ? 'Please mark record(s) for deletion'
        : 'No record(s) selected for deletion';
      prompParams.icon = frm.prompts.deleteNoRecord.icon;
      prompParams.icon_color = frm.prompts.deleteNoRecord.icon_color;
      prompParams.buttons = frm.prompts.deleteNoRecord.buttons;
      prompParams.action = 'delete_no_record';
    }
    return frm.OpenPrompt(prompParams);
  }

  get detailsObject(): any {
    if (!this.moduleExchangeInfo) return null;
    return this.moduleExchangeInfo.detailsObject;
  }

  get noRow(): boolean {
    return this._gridRow ? false : true;
  }

  DetailsButtonClick(e: { button: IPopupButton; sender: any }) {
    // console.log("DetailsButtonClick ....", e.sender,"\nconstructor:",this.constructor.name,"\nhost:",e.sender.data.hostObject)
    // e.sender.dialogRef.close({mode:e.button.value})

    // sender is an instance of DetailsPopup
    const popup = e.sender;

    const data = popup.data;
    if (!data) return;

    const compData = data.component.data;
    if (!compData.componentInstance) return;

    const comp = compData.componentInstance;
    const compForm = comp.form;

    // const host = compData.hostObject;
    // if (!host.detailsObject) return;
    // const detailsForm = host.detailsObject.form;

    if (!compForm) return;

    const ref = e.sender.dialogRef;
    const btn = e.button;

    if (btn.value == 'save') {
      const saveObject = compForm.Save();
      if (saveObject)
        saveObject.subscribe(
          (res) => {
            if (res.action == 'save_with_change') {
              if (res.value == 'yes') {
                compForm.ShowMask('Saving record. Please wait...');
                compForm.PostUpdates().subscribe(
                  (data) => {
                    // NOTE: data is an array of responses for
                    // main table and sub table post process
                    // valid response is obtained from
                    // item with returnCode property specified

                    // set post result object parmeters
                    res.data = data;

                    // set return switches to calling method
                    res.mode = compForm.AccessMode;
                    res.listRequery = compForm.listRequery;
                    res.treeColorReset = compForm.treeColorReset;

                    // close add/edit popup window and return post
                    // results to the calling method

                    const uploader: FileUploaderComponent =
                      compData.componentInstance.fileUploader;
                    if (uploader ? uploader.forUpload0.files.length : false) {
                      comp.data.processing = true; // make buttond disabled...
                      compForm.ShowMask(
                        'Uploading attached file. Please wait...'
                      );
                      // setTimeout(() => {
                      //   compForm.HideMask();

                      // });
                      uploader.Upload((sender) => {
                        console.log('File uploaded!');
                        compForm.HideMask();
                        ref.close(res);
                      });
                    } else {
                      ref.close(res);
                    }

                    //compData.componentInstance.PostSaveProcess(compForm, ref, res);
                    console.log('compData: ', compData, 'uploader:', uploader);
                    // ref.close(res);

                    //ref.close(res);
                  },
                  (err) => {
                    console.log('\nPostUpdates error: ', err);
                  },
                  () => {
                    console.log('\nPostUpdates complete!');
                  }
                );
              }
            }
            // if (res.mode == 'success') {
            //   if (ref) ref.close(res);
            // }else if (res.value == 'ok') {
            //   console.log('nothing to save. closing...',res)
            //   if (ref) ref.close(res);
            // }
          },
          (err) => {
            console.log('Error:', err);
          }
        );
    } else if (btn.value == 'restore') {
      //if (ref) ref.close({value:btn.value});
      console.log(
        '\nComponent form:',
        compForm,
        '\nChanged DATA: ',
        compForm.changed,
        '\nChanged DATA-Sub: ',
        compForm.changedSub
      );
    } else if (btn.value == 'cancel') {
      const cancelObject = compForm.Cancel();
      if (!cancelObject) {
        if (ref) ref.close({ value: btn.value });
      } else {
        cancelObject.subscribe((res) => {
          if (res.value == 'yes') if (ref) ref.close({ value: btn.value });
        });
      }
    }
  }

  PostSaveProcess(form: AppFormAComponent, refDia: any, result: any) {
    console.log('Component form:', form);
    refDia.close(result);
  }

  AddClick(e: any) {

    if (!this.RecordTypeInfo) {
      // if record type information is not available, OpenRecordTypeSelect is not necessary
      this.OpenAddRecord({ e: e, data: null, defaultValues: {} });
      return;
    }

    const subsSelect = this.OpenRecordTypeSelect().subscribe(
      (data) => {
        if (data.value == 'accept' || data.value == 'ok') {
          const compData = data.sender.data.component.data;
          //compData.form.value.recordType
          const recordType = compData.form.value.recordType;
          const rti = this.RecordTypeInfo;
          const defVal: any = {};
          if (rti.recordTypeOptions) {
            defVal[rti.recordTypeField] = recordType;
            if (rti.recordTypeGroupField) {
              const opt = rti.recordTypeOptions.find(
                (o) => o.key == recordType
              );
              if (opt) defVal[rti.recordTypeGroupField] = opt.group;
            }
          }
          this.OpenAddRecord({ e: e, data: data, defaultValues: defVal });
        }
      },
      (err) => {
        console.log('\nOpenRecordTypeSelect, Error ', err);
      },
      () => subsSelect.unsubscribe()
    );
    return;
    //
    // const subs = this.OpenDetails('add').subscribe(
    //   (data) => {
    //     console.log('\nDataGridB, Data ', data);
    //     this.UpdateView(data);
    //   },
    //   (err) => {
    //     console.log('\nDataGridB, Error ', err);
    //   },
    //   () => {
    //     subs.unsubscribe();
    //   }
    // );

    // this.addClick.emit({ e: e, sender: this });
    // if (this.addListener) this.addListener({ e: e, sender: this });
  }

  osb(
    message: string,
    action?: string,
    duration?: number,
    horizontalPosition?: any,
    verticalPosition?: any
  ): void {
    this.appMainService.openSnackBar(
      message,
      action,
      duration,
      horizontalPosition,
      verticalPosition
    );
  }

  OpenAddRecord(args: any) {
    const obs = this.OpenDetails('add', args.defaultValues);
    if (!obs) {
      // this.dataSet
      this.osb(`Cannot launch 'undefined' add row details view...`, 'x', 3000);
      return;
    }

    console.log("OpenAddRecord()! (obs) ", obs)

    const subs = obs.subscribe(
      (data) => {
        console.log("@@@@@@@ OpenAddRecord() data ", data)
        this.UpdateView(data);
      },
      (err) => {
        console.log('\nDataGridB, Error ', err);
        this.osb('Error adding record.', 'x', 4000);
      },
      () => {
        subs.unsubscribe();
      }
    );

    this.addClick.emit({ e: args.e, sender: this });
  }

  EditClick(e: any) {
    const obs = this.OpenDetails('edit');
    if (!obs) {
      // this.dataSet
      this.osb(`Cannot launch 'undefined' edit row details view...`, 'x', 3000);
      return;
    }
    const subs = obs.subscribe(
      (data) => {
        this.UpdateView(data);
      },
      (err) => {
        console.log('\nDataGridB Edit, Error ', err);
        this.osb('Error updating record.', 'x', 4000);
      },
      () => {
        subs.unsubscribe();
      }
    );

    this.editClick.emit(e);

    // if (this.editListener) this.editListener({ e: e, sender: this });
  }
  DeleteClick(e: any) {
    const obs = this.Delete();
    if (!obs) {
      console.log('\nCannot instantiate delete observable');
      return;
    }

    let subsData: any;
    const subs = obs.subscribe(
      (data) => {
        subsData = data;
        if (data.value == 'yes' && !this.bypassDeleteAction) {
          this.DeleteRecord(data);
        } else {
          this.deleteClick.emit({ e: e, data: subsData, sender: this });
          return;
        }
      },
      (err) => {
        console.log('\nDataGridB Delete, Error ', err);
      },
      () => {
        subs.unsubscribe();
      }
    );

    if (this.bypassDeleteAction) return;

    this.deleteClick.emit({ e: e, data: subsData, sender: this });
    if (this.deleteListener) this.deleteListener({ e: e, sender: this });
  }

  DeleteRecord(data: any) {
    const next = this.nextActiveRow;
    const tbl = this._gridRow.parentTable;
    const key = tbl.keyName;

    data.newKey = next ? next[key] : -1;

    const delCol: ColumnInfo = tbl.columns.find(
      (c: ColumnInfo) => c.isDeletedField
    );
    const delDateCol: ColumnInfo = tbl.columns.find(
      (c: ColumnInfo) => c.isDeletedStamp
    );
    const delByCol: ColumnInfo = tbl.columns.find(
      (c: ColumnInfo) => c.isDeletedByStamp
    ); // const params = new RequestParams({
    //   code: tbl.tableCode,
    //   filter: `{${key}|${this._gridRow[key]}}`,
    // });

    const formData: any = { __config__: { useCommonNewKey: false } };
    let postData: any = {};

    const postDataArr: Array<any> = [];
    const dateStamp = this.dataSet.dateStampString;
    const userStamp = this.dataSet.userInfo.name;

    const ids: Array<number> = this.SelectMode
      ? this.SelectedIds
      : [this._gridRow[key]];

    ids.forEach((id) => {
      // initialize object
      postData = {};

      // set flag
      postData[delCol.name] = 1;
      // set stamp
      if (delDateCol) postData[delDateCol.name] = dateStamp;
      if (delByCol) postData[delByCol.name] = userStamp;

      // set key value
      postData[key] = id;

      postDataArr.push(postData);
    });

    formData[this.tableCode] = postDataArr; // single postData into an array

    console.log(
      '\n**** Delete formData:',
      formData,
      ', this.SelectedCount: ',
      this.SelectedCount,
      ', this.SelectedIds: ',
      this.SelectedIds
    );

    const cnt = postDataArr.length;

    this.ShowMask(
      `Deleting ${cnt > 1 ? String(cnt) : ''} record${cnt > 1 ? 's' : ''
      }. Please wait ...`
    );

    const subs = this.dataSet.Post(formData).subscribe(
      (res) => {
        this.UpdateView(data);
      },
      (err) => {
        console.log('\nError deleting record: ', err);
      },
      () => {
        subs.unsubscribe();
      }
    );

    /**
     * const postObs = this.DataSet.Post(formData);

      if (obs) {
        // send progress feedback to client
        // this.dataSource.openSnackBar(msgProgress, 'X', 1000);

        const subs = postObs.subscribe(
          (data) => {
            subs.unsubscribe();

            obs.next(data);
            obs.complete();
          },
          (err) => {
            subs.unsubscribe();

            // errorMessage = err.message;
            // this.dataSource.openSnackBar(eval(msgError), 'X', 5000);

            // // call onSuccess listener
            // if (onError) onError(err);
          }
        );
      }
     */
  }
  ExcelClick(e: any) {
    this.excelClick.emit(e);
    if (this.excelListener) this.excelListener({ e: e, sender: this });
  }

  OpenPreview(e: any) {
    this.openClick.emit(e);
  }

  get isNoGrid(): boolean {
    return !this.grid ? true : false;
  }

  private _SelectMode: boolean = false;
  @Input() set SelectMode(value: boolean) {
    this._SelectMode = value;
  }
  get SelectMode(): boolean {
    return this._SelectMode
  }

  SelectClick(e: any): void {
    this.SelectMode = !this.SelectMode;
    if (!this.SelectMode) {
      this.FilterSelectedFlag = false;
      this.SelectedIds = [];
      this.RefreshClick(null, () => {
        this.selectClick.emit({ mode: this.SelectMode, e: e, sender: this });
      });
    } else {
      this.selectClick.emit({ mode: this.SelectMode, e: e, sender: this });
    }
  }

  SelectAll(e: any): void {
    if (this.isNoGrid) return;
    this.grid.SetAllRows(true);
  }
  UnSelectAll(e: any): void {
    if (this.isNoGrid) return;
    this.grid.SetAllRows(false);
    if (this.FilterSelectedFlag) this.RefreshClick(null);
  }
  SelectInverse(e: any): void {
    if (this.isNoGrid) return;
    this.grid.SelectInverse();
    if (this.FilterSelectedFlag)
      this.osb(
        "Click 'Refresh' to exclude unselected from the filtered list.",
        'x',
        2500
      );
    // if (this.FilterSelectedFlag) this.RefreshClick(null);
  }

  public FilterSelectedFlag: boolean = false;
  FilterSelected(e: any): void {
    if (this.isNoGrid) return;
    this.FilterSelectedFlag = !this.FilterSelectedFlag;
    this._reqInfo.pageNumber = 1;
    setTimeout(() => this.RefreshClick(null));
  }

  get selectedFilterLabel(): string {
    return this.FilterSelectedFlag ? 'Show all items' : 'Show Selected';
  }

  get noSelection(): boolean {
    if (this.SelectMode)
      return this.SelectedIds ? this.SelectedIds.length == 0 : true;
    // return true;
    return !this._gridRow ? true : false;
  }

  public RefreshClick(e?: any, onSuccess?: Function, showMask?: boolean) {
    if (!e) e = null;
    if (!showMask) showMask = false;
    if (showMask) this.ShowMask();
    this.ExtractDataCall({
      message: 'Reloading list. Please wait...',
      onSuccess: (data) => {
        console.log("Reload Data: ", data, "showMask: ", showMask)
        this.refreshClick.emit(data);
        if (onSuccess) onSuccess(data);
      },
    });
  }

  get bound(): any {
    if (!this.GRID_WRAPPER) return null;
    return this.GRID_WRAPPER.nativeElement.getBoundingClientRect();
  }

  FilterClick(e: any) {
    if (this.isLoadingRecords) return;
    this.activeFiltering = !this.activeFiltering;
    if (this.withFilterOrSort) this.RefreshClick(null);
  }

  FilterDropClick(e: any) {
    const bound: any = this.bound;
    //

    setTimeout(() => {
      const listBound: any = this.filterList ? this.filterList.bound : null;

      this.dataSet.cl([
        'FilterDropClick',
        e,
        'Target',
        e.e.target,
        'Grid bound',
        bound,
        'Filter List',
        this.filterList,
        'Filter List bound',
        listBound,
        //    "List Bound",listBound
      ]);

      //
      if (listBound) {
        // reposition filterlist
        this._popTop = 30;
        this._popLeft = bound.width - listBound.width;
      }
    });
  }
  //report


  public _ReportMode: boolean = false;
  @Input() set ReportMode(value: boolean) {
    if (value) {
      this._ReportMode = value;
      this.rights = { allowSelect: false };
    }
  }



  private _Reportpermodule: Array<any> = null;
  public get Reportpermodule(): {} {
    if (this._Reportpermodule == null) {
      let tmpList: Array<any> = [];
      this.dataSet.ReportList.forEach((o) => {
        if (o.rpttype == this.tableCode) {

          tmpList.push(o);
        }
      });
      this._Reportpermodule = tmpList;
    } else {
    }
    return this._Reportpermodule;
  }

  public QryStr: string = ''
  private prevGridPageSize: number;
  public ReportDetails: any;
  reportSelected(op: any) {
    this._ReportMode = true;
    this.ReportDetails = op;
    this.labelReport = "Hide Report"
    this.prevGridPageSize = this.grid.currentPageSize;
    this.activeFiltering = true;
    //currentPageSize
    console.log("->>>>>> prevGridPageSize: ", this.prevGridPageSize);
    this.PageSizeChange({ pageSize: this.reportPageSize });


    // this.QryStr = "http://imsareport.ivideolib.com/report_handler.ashx?" + 
    // "report_name=" + op.rptcode + "&" +
    //  "where_clause=" + this.grid.sourceTable.keyName + " IN(" + this.rrowIds + ")&" +
    //  "asset_description=" + op.assetdesc + "&" +
    //  "hierarchy=" + op.hierarchy + "&" +
    //  "asset_id=" + op.assetid

    this.QryStr = "http://imsareport.ivideolib.com/report_handler.ashx?" +
      "report_name=" + op.rptcode + "&" +
      "asset_description=" + this.CurrentTreeNode.text + "&" +
      "hierarchy=" + 1 + "&" +
      (op.rptcode == "AN_07" || op.rptcode == "AN_08" || op.rptcode == "AN_14" || op.rptcode == "AN_10" ?
        "asset_id=-1" :
        (op.rptcode == "AN_04" ? 'asset_id=' + this.CurrentTreeNode.did : "where_clause=" + this.grid.sourceTable.keyName + " IN(" + this.rowIds + ")&asset_id=" + this.CurrentTreeNode.did))


  }

  ReportClicked(e: any) {
    if (this._ReportMode) {
      this._ReportMode = false;
      this.labelReport = "Report"
      this.activeFiltering = false;
      this.PageSizeChange({ pageSize: this.prevGridPageSize ? this.prevGridPageSize : this.DEFAULT_PAGE_SIZE })
      console.log('\npasok  ', this._ReportMode, " this.prevGridPageSize : ", this.prevGridPageSize);
    }
  }


  //end report

  private _popTop: number = 0;
  get popTop(): number {
    return this._popTop;
  }
  private _popLeft: number = 0;
  get popLeft(): number {
    return this._popLeft;
  }

  UpdateView(data: any) {

    const detForm = this.moduleExchangeInfo.detailsObject.form;
    if (data.mode == 'edit') {
      // update details form view

      detForm.Requery({
        onSuccess: (form) => {
          if (this._gridRow) {
            // update grid row display
            const tbl = this._gridRow.parentTable;

            if (!data.listRequery) {
              const formObject = form.formObject;
              if (tbl) {
                // iterate through table columns and assign
                tbl.columns.forEach((c) => {
                  if (
                    formObject.value[c.name] != undefined &&
                    c.name != tbl.keyName
                  )
                    this._gridRow[c.name] = formObject.value[c.name];
                  // if (
                  //   this._gridRow[c.name] != undefined &&
                  //   c.name != tbl.keyName
                  // ) {
                  //   this._gridRow[c.name] = formObject.value[c.name];
                  // }
                });
                this.osb('Successfully updated record.', 'x', 2000);
              }
            } else {
              // requery list
              const newKey = this._gridRow[tbl.keyName];
              this.ExtractDataCall({
                newKey: newKey,
                onSuccess: (ret) => {
                  console.log('\nSuccess UpdateView when adding record: ', ret);
                  this.osb('Successfully updated record.', 'x', 2000);
                },
                onError: (err) => {
                  console.log('\nError UpdateView when adding record: ', err);
                  this.osb('Error updating record.', 'x', 2000);
                },
              });
            }
          }
        },
      });
    } else if (data.mode == 'add') {

      // get new return id
      const res = data.data.find((r) => r.returnCode == detForm.TableCode);
      const newKey = res ? res.returnDataParams.newKey : -1;

      this.ExtractDataCall({
        newKey: newKey,
        onSuccess: (ret) => {
          console.log('\nSuccess UpdateView when adding record: ', ret);
          this.osb('Successfully added record.', 'x', 2000);
        },
        onError: (err) => {
          console.log('\nError UpdateView when adding record: ', err);
          this.osb('Error adding record.', 'x', 4000);
        },
      });
    } else if (data.action == 'delete_with_record') {
      this.RecolorTree();
      this.ExtractDataCall({
        newKey: data.newKey,
        onSuccess: (ret) => {
          console.log('\nSuccess UpdateView when deleting record: ', ret);
          this.SelectedIds = [];
          this.osb('Successfully deleted record.', 'x', 4000);
        },
        onError: (err) => {
          console.log('\nError UpdateView when deleting record: ', err);

          this.osb('Error deleting record.', 'x', 4000);
        },
      });
    } else {
      //
    }

    if (data.treeColorReset) this.RecolorTree();
    this.HideMask();
  }

  RecolorTree(): void {
    if (this.CurrentTreeNode)
      if (this.CurrentTreeNode.treeView) {
        this.dataSet.treeColorData = null; // will trigger re-fetching of tree color data
        this.CurrentTreeNode.treeView.ResetStatus(); // will set all status to value that will allow re-assignment of color
      }
  }

  AcceptChanges(args: any) { }

  /**
   *       [pageNumber]="reqInfo.pageNumber"
      [pageSize]="reqInfo.pageSize"
      [totalPages]="reqInfo.totalPages"
      [totalRecords]="reqInfo.totalRecords"
   */

  private _reqInfo: IRequestInfo = {};
  set reqInfo(value: IRequestInfo) {
    this._reqInfo = value;
  }
  get reqInfo(): IRequestInfo {
    if (!this._reqInfo.pageNumber && !this._noFooter) {
      this._reqInfo.pageNumber = 1;
      this._reqInfo.pageSize = this.DEFAULT_PAGE_SIZE;
      // this._reqInfo.totalRecords = 1000;
      // this._reqInfo.totalPages = 5;
    }

    return this._reqInfo;
  }

  OnSelectChange(e: { row: any; mode: boolean; sender: DataGridComponent }) {
    const { row, mode, sender } = e;
    if (!mode && this.FilterSelectedFlag) {
      this.osb(
        "Item unselected. Click 'Refresh' to exclude unselected from the filtered list.",
        'x',
        2500
      );
    }
    // if (this.SelectMode && this.FilterSelectedFlag)
    //   setTimeout(() => this.RefreshClick(null));
  }

  PageClick(e: any) {
    this._reqInfo.pageNumber = e.page;
    this.ExtractDataCall({
      onSuccess: (data) => {
        // console.log('\n###### PAGE SIZE CAHNGED!');
      },
    });
  }
  PageSizeChange(e: any) {
    this._reqInfo.pageNumber = 1;
    this._reqInfo.pageSize = e.pageSize;
    this.ExtractDataCall({
      onSuccess: (data) => {
        // console.log('\n###### PAGE SIZE CAHNGED!');
      },
    });
  }

  ShowMask(message?: string) {
    // if (!message) message = 'Loading. Please wait...';
    if (message) this.maskMessage = message;
    setTimeout(() => (this.isLoadingRecords = true));
  }
  HideMask(): void {
    setTimeout(() => {
      this.isLoadingRecords = false;
      this.maskMessage = 'Loading. Please wait...';
    })
  }
}
