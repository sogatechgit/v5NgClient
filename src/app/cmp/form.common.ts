import {
  DataColumn,
  FilterDataType,
  IFieldDefParam,
  IFieldExpression,
} from './../api/mod/app-common.classes';
import { ColumnInfo } from './../api/mod/app-column.model';
import { AppFormAComponent } from './../api/cmp/app-form-a/app-form-a.component';
import {
  AppDataset,
  IAccessRights,
  ModuleState,
} from './../svc/app-dataset.service';
import { AppMainServiceService } from './../svc/app-main-service.service';
import { RequestParams } from './../api/mod/app-params.model';

import { Subscription, Observable } from 'rxjs';

import { DataTab } from './../api/cmp/data-tabs/data-tabs.component';
import {
  DataGridComponent,
  DataGridColumn,
} from './../api/cmp/data-grid/data-grid.component';

import {
  TreeViewNode,
  TreeViewComponent,
} from './../api/cmp/tree-view/tree-view.component';
import {
  Input,
  ViewChild,
  Component,
  ComponentFactoryResolver,
} from '@angular/core';

import {
  FormGroup,
  FormControl,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { DataGridOption } from '../api/cmp/data-grid/data-grid.component';
import { DataTabsOption } from '../api/cmp/data-tabs/data-tabs.component';

@Component({
  template: '',
})
export class FormCommon {
  constructor(public dataSource: AppMainServiceService) {}

  @ViewChild('mainGrid') mainGrid: DataGridComponent;

  @Input() public moduleId: number = -1;
  @Input() public formTitle: string = '';
  @Input() public sourceTable: any = null;
  @Input() public assetField: string = null;
  @Input() public deletedFlagField: string = null;
  @Input() public treeView: TreeViewComponent;

  @Input() public detailsHeight: number = 180;

  public get detailsSubgridHeight(): number {
    return this.detailsHeight ? this.detailsHeight - 45 : 0;
  }

  myForm: FormGroup = null;

  public suppressPendingRequestFlag: boolean = false;

  private _moduleTitle: string = '';
  private _moduleItem: any = null;

  CommonFormInit() {
    // bypass this method if the module state object is already initialized
    if (this.moduleParamsInitialized) return;

    if (this.sourceTable != null && this.mainGridOptions != null) {
      // set initial join expression and filter parameters
      // *** base where ***
      // place base filter expressions here if applicable
      // *** base order by ***
      //.OrderBy([])
      // SET BASE WHERE AND ORDER BY CLAUSE
      this.mainGridOptions
        // SET FROM CLAUSE
        .From(this.sourceTable.tableCode)
        .InnerJoin({
          code: 'tre',
          localField: this.assetField,
          foreignField: 'TRE_DAT_TAG',
        })
        .InnerJoin({
          code: 'node',
          localField: this.assetField,
          foreignField: 'REC_TAG',
        }).BaseFilterDefineOn().BaseFilterDefineOff();
    } else {
      console.log('from clause not set!', this.sourceTable != null);
    }

    // create all controls in main form object
    this.mainFormObject = this.GetRowFormObject(true);
    console.log('Initial this.mainFormObject:', this.mainFormObject);
  }

  public get ds(): AppDataset {
    //return this.dataSource.DataSources[0];
    return this.dataSource.ActiveSource.appDataset;
  }

  public get activeTab(): DataTab {
    if (!this.mainTabsOptions.activeTab)
      return new DataTab({ id: -1, label: 'unknown' });
    return this.mainTabsOptions.activeTab;
  }

  public get moduleTitle() {
    if (this.formTitle) this._moduleTitle = this.formTitle;

    if (this._moduleTitle == '') {
      const menuList = this.ds.menuList;

      menuList.forEach((m) => {
        if (m.subMenu) {
          const menuItem = m.subMenu.find((sm) => sm.id == this.moduleId);
          if (menuItem) this._moduleTitle = menuItem.label;
        }
      });
    }
    return this._moduleTitle + ' Module';
  }

  public get moduleData(): any {
    return 'data';
  }

  public get currTreeNode(): TreeViewNode {
    return this.ds.currTreeNode;
  }

  public get gridPanelHeight(): string {
    return 'calc(100vh - ' + (this.detailsHeight + 141) + 'px)';
  }

  public get reqInfo(): any {
    return this.sourceTable.lastRequestDataParams;
  }

  public get rootLocation(): string {
    return this.ds.rootNodeLocation;
    //return 'aa%';
  }

  public get isLoadingData(): boolean {
    return this.sourceTable.pendingRequest && !this.suppressPendingRequestFlag;
  }

  private _isRowWaiting: boolean = false;
  public get isRowWaiting(): boolean {
    return this._isRowWaiting;
  }

  public get promptLoadingData(): string {
    if (!this.ds.currTreeNode) return 'Loading...';
    return (
      'Loading data from ' +
      this.ds.currTreeNode.text +
      ' branch. Please wait...'
    );
  }

  private _rights: IAccessRights = {};
  public get rights(): IAccessRights {
    // place user specific access permission codes here ..
    if (!this._rights.allowManage) this._rights.allowManage = true;
    if (!this._rights.allowAdd) this._rights.allowAdd = true;
    if (!this._rights.allowEdit) this._rights.allowEdit = true;
    if (!this._rights.allowDelete) this._rights.allowDelete = true;
    if (!this._rights.allowPrint) this._rights.allowPrint = true;
    if (!this._rights.allowExcel) this._rights.allowExcel = true;

    return this._rights;
  }
  public set rights(value: IAccessRights) {
    if (!value) this._rights = {};
    else {
      for (let key in value) this._rights[key] = value[key];
    }
  }

  private _sourceRow: any = null;
  public get sourceRow(): any {
    //@Input() public sourceRow: any = null;
    //return this._sourceRow;
    if (!this.sourceTable) return null;
    //return this.sourceTable.currentRow;
    return this._sourceRow;
  }

  public get moduleParamsInitialized(): boolean {
    return this.mainGridOptions.columns.length != 0;
    // return this.moduleState.setupDataCalled;
  }

  public get mainGridOptions(): DataGridOption {
    return this.moduleState.mainGridOptions;
  }
  public get mainTabsOptions(): DataTabsOption {
    return this.moduleState.mainTabsOptions;
  }
  public get mainFormCollection(): Array<AppFormAComponent> {
    return this.moduleState.mainFormCollection;
  }
  public get mainFormObject(): FormGroup {
    return this.moduleState.mainFormObject;
  }
  public set mainFormObject(value: FormGroup) {
    this.moduleState.mainFormObject = value;
  }
  public get mainRecordsBuffer(): Array<any> {
    return this.moduleState.mainRecordsBuffer;
  }

  public get gridSourceRows(): Array<any> {
    return this.moduleState.gridDataSource;
  }

  public set gridSourceRows(value: Array<any>) {
    this.moduleState.gridDataSource = value;
  }

  public get currentRow(): any {
    return this.moduleState.currentRow;
  }

  public set currentRow(value: any) {
    this.moduleState.currentRow = value;
  }

  public get gridSourceLookups(): Array<any> {
    return this.moduleState.gridSourceLookups;
  }
  public set gridSourceLookups(value: Array<any>) {
    this.moduleState.gridSourceLookups = value;
  }

  private _moduleState: ModuleState;
  public get moduleState(): ModuleState {
    if (this._moduleState == undefined) {
      let ms: ModuleState = this.ds.moduleStates.find(
        (mState) => mState.moduleId == this.moduleId
      );
      if (!ms) {
        ms = new ModuleState(this.moduleId);
        this.ds.moduleStates.push(ms);
      }
      this._moduleState = ms;
    }
    return this._moduleState;
  }

  public AddGridAssetLookupItem(key: number, name: string) {
    const lkp = this.gridSourceLookups['ASSETNAME'];
    if (!lkp) return;
    lkp[key] = name;
  }

  public isMainTabActive(id: number): boolean {
    const tab: DataTab = this.activeTab;
    if (tab) return false;
    return this.activeTab.id == id;
  }

  // Placeholder for setting up filter Overidden from
  // specific modules
  public SetFilterParams(): void {
    // this method is a provision to set more module specific filter parameters
    //
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
      const mos = this.dataSource.apiCommon.MONTHS(+moArr[0]);
      const mo = mos[+moArr[1] - 1];
      return value + '-' + mo.end + this.END_TIME;
    } else return value + this.END_TIME;
  }

  private _customFilterList: Array<any> = [
    '2011-01-01',
    '2011-01-02',
    '2011-02-02',
    '2011-02-15',
    '2011-02-17',
    '2012-01-01',
    '2012-03-03',
  ];
  public get customFilterList(): Array<any> {
    return this._customFilterList;
  }

  private BuildCustomFilterList(
    option: DataGridOption,
    column: DataGridColumn,
    filter: string,
    dataType: number,
    onSuccess?: Function
  ): void {
    // populates this._customFilterList variable which is used
    // by filterParameters component for custom selection
    //this.dataSource.ActiveSource.appDataset

    const isDate = dataType == FilterDataType.DATE;

    let params: RequestParams = new RequestParams();

    let includedFields: string = column.fieldName;
    if (column.lookupParams) {
      includedFields = `${column.lookupParams.inlineLookupTableAlias}.${column.lookupParams.inlineLookupTableField}`;
    }

    params.code = option.fromClauseCode;
    params.filter =
      (this.BaseFilter ? this.BaseFilter + (filter ? '^' : '') : '') + filter;
    params.includedFields = includedFields + (isDate ? '@^^DATE' : '');
    // params.sortFields = column.fieldName;
    params.snapshot = true;
    params.distinct = true;

    params.fieldMap = option.fieldMap;

    // to prevent progress display to appear on main grid
    this.suppressPendingRequestFlag = true;

    this.ds.Get([params], {
      onSuccess: (data) => {
        console.log(data);
        if (data.raw.length) {
          const rows = data.raw[0].recordsList;

          let tmpList: Array<string> = [];

          // if recordlist is not null
          if (rows) {
            rows.forEach((row) => tmpList.push(row[0]));

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

          this._customFilterList = tmpList;
          if (onSuccess) onSuccess(this.customFilterList);
        } else {
          console.log('No return object found!');
        }
        this.suppressPendingRequestFlag = false;
      },
      onError: (err) => {
        console.log('Error', err);
        this.suppressPendingRequestFlag = false;
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

    console.log('\nModule ApplyFilter:', e, 'Data type', dataType);

    //column.filters = [];

    // clear filter expressions stored in _WhereTree array
    // go through all columns where filtering is allowed and where filter parameter is set

    // preserve where tree when action is simply
    // getting whereClause when the current column's
    // filter is not included
    let whereTree: Array<IFieldExpression> = null;
    if (exclCurr) whereTree = option.WhereTree;

    // initialize sort parameters
    let sortFields: Array<IFieldDefParam> = [];

    // clear all filter
    option.SubFilterClear();

    let withFilters: boolean = false;
    let initialColumn: string = '';
    option.columns.forEach((c) => {
      if (withFilters) return;
      if (c.filters)
        if (c.filters.length) {
          if (!initialColumn) initialColumn = c.fieldName;
          withFilters = true;
        }
    });

    if (withFilters)
      option.columns.forEach((c) => {
        // end time for date type column

        // if current column must be excluded and c is the column passed in the parameter
        if (exclCurr && c.fieldKey == column.fieldKey) return;

        // 'return' statement here will not exit the main function (i.e. ApplyFilter),
        // but will only exit the callback function within the forEach method of the collection
        if (!c.allowFilter) return;

        // check if field is a lookup type field where filtering and sorting must be made on the
        // linked display field from a lookup table

        let fldParam: IFieldDefParam;
        let fld: DataColumn;
        if (c.displayField && c.filters) {
          // lookup type field
          fld = option.fields.find(
            (fl) => fl.fieldAlias == c.displayField && fl.tableAlias
          );
        }
        if (c.filters)
          if (c.filters.length != 0) {
            console.log(`${c.caption}:${c.filters.length}`);

            // start a group when filter expresion for a particular column
            // is more than 1
            if (c.filters.length > 1) {
              if (initialColumn == c.fieldName) option.GroupStart();
              else option.And().GroupStart();
            }

            c.filters.forEach((f: IFieldExpression) => {
              if (fld) {
                fldParam = {
                  fieldName: fld.fieldName,
                  tableAlias: fld.tableAlias,
                  // fieldAlias:fld.fieldAlias
                };
              } else {
                fldParam = f.fieldParam;
              }

              if (f.logicalAndGroupStart) option.ANDS();
              else if (f.logicalAndGroupEnd) option.ANDE();
              else if (f.logicalAnd) option.And();
              else if (f.logicalOrGroupStart) option.ORS();
              else if (f.logicalOrGroupEnd) option.ORE();
              else if (f.logicalOr) option.Or();
              else if (f.groupStart) option.GroupStart();
              else if (f.groupEnd) option.GroupEnd();
              else {
                // get filter type
                const dataType = f.fieldParam.filterDataType;
                const dataFormat = f.fieldParam.fieldFormat;
                const isDate = dataType == FilterDataType.DATE;

                const v = isDate
                  ? this.periodStartDate(f.value, dataFormat)
                  : f.value; // f.value + (dataFormat == 'YEAR' ? '-01-01' : '');
                const vEnd = isDate
                  ? this.periodEndDate(f.value, dataFormat)
                  : null;

                const v1 = f.value1;
                const v2 = f.value2;
                const v2End = isDate ? v2 + this.END_TIME : null;

                switch (f.operator) {
                  case 'in':
                    option.In(fldParam, f.values);
                    break;
                  case 'eq':
                    if (isDate) option.Between(fldParam, v, vEnd);
                    else option.Equal(fldParam, v);

                    break;
                  case 'neq':
                    if (isDate) option.NotBetween(fldParam, v, vEnd);
                    else option.NotEqual(fldParam, v);

                    break;
                  case 'lt':
                    option.LessThan(fldParam, v);
                    break;
                  case 'lte':
                    option.LessThanOrEqual(fldParam, isDate ? vEnd : v);
                    break;
                  case 'gt':
                    option.GreaterThan(fldParam, isDate ? vEnd : v);
                    break;
                  case 'gte':
                    option.GreaterThanOrEqual(fldParam, v);
                    break;

                  case 'bgw':
                    option.Like(fldParam, `${f.value}%%`);
                    break;
                  case 'enw':
                    option.Like(fldParam, `%%${f.value}`);
                    break;
                  case 'lk':
                    option.Like(fldParam, `%%${f.value}%%`);
                    break;

                  case 'btw':
                    option.Between(fldParam, v1, isDate ? v2End : v2);
                    break;
                  case 'nbtw':
                    option.NotBetween(fldParam, v1, isDate ? v2End : v2);
                    break;
                  default:
                }
              }
            }); // c.filters.length != 0; c.filters; !clear
            // end the group when filter expresion for a particular column
            // is more than 1
            if (c.filters.length > 1) option.GroupEnd();
          } // if filters.length!=0;

        // set column sorting
        if (c.sortAsc || c.sortDesc) {
          if (!fld)
            fldParam = { fieldName: c.fieldName, sortDescending: c.sortDesc };
          // column is  a lookup type, need to make use of the display field for sorting
          // instead of the value field.
          else
            fldParam = {
              fieldName: fld.fieldName,
              tableAlias: fld.tableAlias,
              sortDescending: c.sortDesc,
            };

          sortFields.push(fldParam);
        }

        option.OrderBy(sortFields);

        // if(c.allowFilter)
        // console.log(c.fieldKey,c.filters ? c.filters.length : 'no filters');
        // else console.log(c.fieldKey,"not filterable")
      });
    // end of if(withFilters)

    console.log('\nWhereTree:', option.WhereTree);
    // console.log('\nWhereTree FILTER:', JSON.stringify(option.WhereTree));
    console.log('\nWhereTree FILTER:', option.whereClause);
    console.log('\nSORT:', sortFields, option.orderByClause);

    if (exclCurr)
      this.BuildCustomFilterList(
        option,
        column,
        option.whereClause,
        dataType,
        onBuildList
      );

    // restore saved where clause
    if (exclCurr && whereTree) option.WhereTree = whereTree;

    if (!saveOnly && !exclCurr) {
      console.log('execute query only not just saving it');
      this.SetupData();
    }
  }

  public get BaseFilter(): string {
    let location: string = !this.ds.currTreeNode
      ? this.rootLocation + '%%'
      : this.ds.currTreeNode.loc + ',' + this.ds.currTreeNode.loc + '%%';

    location = `"${location.replace(/,/gi, '","')}"`;
    // base filter is on tree node location
    let filter: string = this.assetField ? `{TRE_NOD_LOC|${location}}` : '';
    filter += this.deletedFlagField
      ? '^' + `({${this.deletedFlagField}|0}|{${this.deletedFlagField}|null})`
      : '';

    return `(${filter})`;
  }

  SetupData(pageNumber?: number, pageSize?: number) {
    // Get initial table data, get
    //http://ngimsa.ivideolib.com/api/app/svyhdr/-/@tre|TRE_NOD_LOC/-/-/-/1/10000?key=$$$$$;,$$$$$;%25

    const fieldList = this.mainGridOptions.FieldList;

    // this flag is set to make sure that module initialization  is arleady called
    this.moduleState.setupDataCalled = true;

    if (pageNumber == undefined || pageSize != undefined) pageNumber = 1;

    if (pageSize == undefined) {
      if (this.reqInfo.pageSize) {
        pageSize = this.reqInfo.pageSize;
      } else {
        pageSize = this.mainGridOptions.pageSize;
      }
    }

    // let location: string = !this.ds.currTreeNode
    //   ? this.rootLocation
    //   : this.ds.currTreeNode.loc + ',' + this.ds.currTreeNode.loc + '%%';

    // location = `"${location.replace(/,/gi, '","')}"`;

    // base filter is on tree node location
    // let filter: string = this.assetField ? `{TRE_NOD_LOC|${location}}` : '';
    // filter += this.deletedFlagField
    //   ? '^' + `({${this.deletedFlagField}|0}|{${this.deletedFlagField}|null})`
    //   : '';
    // filter = `(${filter})`;
    this.SetFilterParams();
    // get filter defined within the
    if (this.deletedFlagField) {
      // add deleted flag to the base filter of the main grid option object
    }

    const localFilter = this.mainGridOptions.whereClause;
    // Base request parameters where initially common filtering and sorting is applied
    const filter: string =
      this.BaseFilter + (localFilter ? '^' + localFilter : '');

    let requestParams: RequestParams = {
      code: this.mainGridOptions.fromClauseCode,
      includedFields: fieldList,
      filter: filter,
      pageNumber: pageNumber,
      pageSize: pageSize,
      fieldMap: this.mainGridOptions.fieldMap,
      //clearExisting: true,
      snapshot: true,
      sortFields: this.mainGridOptions.orderByClause,
    };

    console.log('SetupData requestParams:', requestParams);

    this.ds.Get([requestParams], {
      onSuccess: (data) => {
        //  console.log('\n*** SetupData Success', data);
        // processed rows for the grid to display
        // this._gridSourceRows = data.processed.data[0];
        this.gridSourceRows = data.processed.data[0];

        // inline lookup definitions
        // this._gridSourceLookups = data.processed.lookups[0];
        this.gridSourceLookups = data.processed.lookups[0];

        // refresh data grid to display extracted data
        if (this.mainGrid) this.mainGrid.Refresh();

        // reset current row
        let row: any = null;
        // if (this._gridSourceRows.length) row = this._gridSourceRows[0];
        if (this.gridSourceRows)
          if (this.gridSourceRows.length) row = this.gridSourceRows[0];

        // console.log('RETURN DATA:', data, 'ROW:', row);
        this.ResetCurrentRow(row);
        this.mainGridOptions.RecordExtractedDataFieldnames();
      },
    });
  }

  TabClicked(tab: DataTab) {
    // this method will be overridden
    // in the derived form
  }

  public ChangePage(args: any) {
    this.SetupData(args.page);
  }

  public PageSizeChange(args: any) {
    this.SetupData(1, args.pageSize);
  }

  AddRecordEvent(args: any) {
    console.log('AddRecordEvent', args);
  }
  EditRecordEvent(args: any) {
    console.log('EditRecordEvent', args);
  }

  PrintRecordEvent(args: any) {
    console.log('PrintRecordEvent', args);
  }

  SearchEvent(args: any) {
    console.log('SearchEvent', args);
  }

  FilterEvent(args: any) {
    //console.log('FilterEvent', args);
    this.moduleState.filteringActive = !this.moduleState.filteringActive;
  }

  public GetRowFormObject(blankForm?: boolean): FormGroup {
    // create form object containing controls based on the entire
    // table field definitions which contains values from the current row.

    if (!blankForm) blankForm = false;

    if (!this.sourceTable || (!this.currentRow && !blankForm)) return null;

    const form: FormGroup = new FormGroup({});
    const cols: Array<ColumnInfo> = this.sourceTable.columns;
    const row = this.currentRow;

    // loop through the table's column definitions
    cols.forEach((c) => {
      const fieldName = c.name;
      const ctrl: AbstractControl = new FormControl(
        blankForm ? null : row[fieldName]
      );
      form.addControl(fieldName, ctrl);
    });

    return form;
  }

  DataChanged(form: FormGroup, row: any, isNew?: boolean): any {
    if (!isNew) isNew = false;
    let ret: any = null;

    // get table defintion of the row
    const tbl = row.parentTable;
    if (!tbl) return null;
    const cols = tbl.columns;
    if (!cols) return null;

    for (const field in form.controls) {
      // 'field' is a string
      const ctrl: AbstractControl = form.get(field); // 'control' is a FormControl
      const col = cols.find((c) => c.name == field);
      if (col) {
        const includeField: boolean =
          (isNew && ctrl.value != undefined) ||
          (!isNew && ctrl.value != row[field]);
        if (includeField) {
          if (!ret) ret = {};
          ret[field] = ctrl.value;
        }
      }

      if (col && ctrl.value != row[field]) {
        // field value changed
        if (!ret) ret = {};
        ret[field] = ctrl.value;
      }
    }

    return ret;
  }

  // DeleteRecordEvent(args: {
  //   row: any;
  //   userStampFields?: Array<string>;
  //   dateStampFields?: Array<string>;
  //   extraPostParam?: any;
  //   onSuccess?: Function;
  //   onError?: Function;
  //   messages?: {
  //     msgSuccess?: string;
  //     msgError?: string;
  //     msgTitle?: string;
  //     msgWarning?: string;
  //     msgProgress?: string;
  //   };
  // }) {
  //   if (!args) return;

  //   let {
  //     row,
  //     userStampFields,
  //     dateStampFields,
  //     extraPostParam,
  //     onSuccess,
  //     onError,
  //     messages,
  //   } = args;

  //   if (!messages) messages = {};

  //   let { msgSuccess, msgError, msgTitle, msgWarning, msgProgress } = messages;
  //   let postErrMsg: string = 'error';

  //   if (!msgTitle) msgTitle = 'Confirm Delete';
  //   if (!msgWarning)
  //     msgWarning =
  //       'You are about to delete the current record.<br/><br/>Do you want to continue?';
  //   if (!msgProgress) msgProgress = 'Deleting record. Please wait...';
  //   if (!msgError) msgError = '`Error deleting record (${postErrMsg})...`';
  //   if (!msgSuccess) msgSuccess = 'Record deletion successful.';

  //   const delFlag = this.deletedFlagField;

  //   if (!this.deletedFlagField) {
  //     // prompt to select a record if currentRow is null
  //     this.dataSource.Confirm(
  //       'Delete flag field not set',
  //       'Please specify delete flag field when instantiating component in<br/>main-frame template.',
  //       { width: 500, height: 200 }
  //     );
  //     return;
  //   }

  //   if (!row) {
  //     // prompt to select a record if currentRow is null
  //     this.dataSource.Confirm(
  //       'No current record',
  //       'Please select a record to delete',
  //       { width: 450 }
  //     );
  //     return;
  //   }

  //   // confirm if deletion will proceed
  //   this.dataSource
  //     .Confirm(msgTitle, msgWarning, {
  //       width: 500,
  //       height: 250,
  //       labelNo: 'No',
  //       labelYes: 'Yes',
  //     })
  //     .subscribe((result) => {
  //       if (result)
  //         if (result.mode == 'yes') {
  //           let delReqParams: any = {};
  //           const tbl = row._parentTable;
  //           if (!tbl) {
  //             console.log(
  //               '!RECORD NOT DELETED BECAUSE TABLE DEFINITION IS NOT FOUND!'
  //             );
  //             return;
  //           }

  //           // initialize form data variable
  //           const formData = {};
  //           const changed = {};

  //           // set key value
  //           changed[tbl.keyName] = row[tbl.keyName];

  //           // set deleted flag field to 1 if defined
  //           changed[this.deletedFlagField] = 1;

  //           // set user stamp update
  //           // set user date update

  //           // populate formData main object
  //           formData[tbl.tableCode] = [changed];
  //           const assetId = this.assetField ? row[this.assetField] : null;

  //           console.log(
  //             'Row ID:',
  //             row[tbl.keyName],
  //             'changed:',
  //             formData,
  //             'assetId:',
  //             assetId,
  //             'row:',
  //             row
  //           );

  //           this.PostUpdate({
  //             row: row,
  //             dataToPost: changed,
  //             userStampFields: userStampFields,
  //             dateStampFields: dateStampFields,
  //             onSuccess: onSuccess,
  //             onError: onError,
  //             recolorTree: true,
  //             requeryGrid: true,
  //             messages: {
  //               msgProgress: msgProgress,
  //               msgSuccess: msgSuccess,
  //               msgError: msgError,
  //             },
  //             assetId: assetId,
  //           });
  //         }
  //     });
  // }

  // SaveData(args: {
  //   form: FormGroup;
  //   row: any;
  //   isNew?: boolean;
  //   dialogRef?: any;
  //   extraPostParam?: any;
  //   userStampFields?: Array<string>;
  //   dateStampFields?: Array<string>;
  //   revField?: string;
  //   onSuccess?: Function;
  //   onError?: Function;
  //   onCancel?: Function;

  //   recolorTree?: boolean;
  //   requeryGrid?: boolean;
  //   requeryDetails?: boolean;

  //   messages?: {
  //     saveSuccess?: string;
  //     saveError?: string;
  //     saveWarning?: string;
  //     postingNow?: string;
  //   };
  // }) {
  //   let {
  //     form,
  //     row,
  //     isNew,
  //     dialogRef,
  //     extraPostParam,
  //     userStampFields,
  //     dateStampFields,
  //     revField,
  //     onSuccess,
  //     onError,
  //     onCancel,
  //     recolorTree,
  //     requeryGrid,
  //     requeryDetails,
  //     messages,
  //   } = args;

  //   if (isNew == undefined) isNew = false;

  //   // set messages
  //   if (messages == undefined) messages = {};
  //   let { saveSuccess, saveError, saveWarning, postingNow } = messages;

  //   if (!saveSuccess) saveSuccess = 'Record saved.';
  //   if (!saveError)
  //     saveError = 'Sorry. An error has occured when posting data.';
  //   if (!saveWarning) saveWarning = 'Save record?';
  //   if (!postingNow) postingNow = 'Posting data. Please wait...';

  //   const changed = this.DataChanged(form, row, isNew);

  //   if (changed) {
  //     const assetId = row && this.assetField ? row[this.assetField] : null;

  //     this.dataSource
  //       .Confirm('Confirm Save', saveWarning, {
  //         width: 500,
  //         height: 230,
  //         labelYes: 'Yes',
  //         labelNo: 'No',
  //       })
  //       .subscribe((result) => {
  //         if (result.mode == 'yes') {
  //           this.PostUpdate({
  //             row: row,
  //             dataToPost: changed,
  //             userStampFields: userStampFields,
  //             dateStampFields: dateStampFields,
  //             extraPostParam: extraPostParam,
  //             revField: revField,
  //             isNew: isNew,
  //             dialogRef: dialogRef,
  //             onSuccess: onSuccess,
  //             onError: onError,
  //             recolorTree: recolorTree,
  //             requeryGrid: requeryGrid,
  //             requeryDetails: requeryDetails,
  //             assetId: assetId,
  //           });
  //         } else {
  //           this.dataSource.openSnackBar('Continue editing record.', 'X', 1500);
  //           if (onCancel) onCancel(null);
  //         }
  //       });
  //     return;
  //   } else {
  //     this.dataSource
  //       .Confirm(
  //         'Nothing to change',
  //         'No modifications made to the current record.',
  //         { width: 450, height: 180 }
  //       )
  //       .subscribe((ret) => {
  //         if (onCancel) onCancel(null);
  //       });
  //   }
  // }

  PostUpdate(args: {
    row: any;
    dataToPost: any;
    userStampFields?: Array<string>;
    dateStampFields?: Array<string>;
    extraPostParam?: any;
    revField?: string;
    isNew?: boolean;
    onSuccess?: Function;
    onError?: Function;
    dialogRef?: any;
    recolorTree?: boolean;
    requeryGrid?: boolean;
    requeryDetails?: boolean;
    assetId?: number;
    messages?: {
      msgProgress?: string;
      msgSuccess?: string;
      msgError?: string;
    };
  }) {
    // deconstruct arguments
    let {
      row,
      dataToPost,
      userStampFields,
      dateStampFields,
      extraPostParam,
      revField,
      isNew,
      onSuccess,
      onError,
      dialogRef,
      recolorTree,
      requeryGrid,
      requeryDetails,
      assetId,
      messages,
    } = args;

    if (!messages) messages = {};
    let { msgProgress, msgSuccess, msgError } = messages;
    let errorMessage: string = 'undefined error.';

    if (!msgProgress) msgProgress = 'Posting data. Please wait...';
    if (!msgSuccess) msgSuccess = 'Data posted successfully.';
    if (!msgError) msgError = '`Error posting data: ${errorMessage}`';

    // get table specific parameters
    const tbl = this.sourceTable;
    const tableCode = tbl.tableCode;
    const keyName = tbl.keyName;

    // set record's key field value if not yet set,
    // which normally is the case on editing mode.
    // when mode is adding a new record, key value is
    // normally set at the calling component, with integer value
    // less than zero (0) to indicate that a new record is
    // to be created
    if (dataToPost[keyName] == undefined) dataToPost[keyName] = row[keyName];

    // handle stamps
    if (userStampFields) {
      // set value of fields to contain the current user's
      // name as enumerated in the calling (add/edit/delete) component
      // eg. CREATED_BY, UPDATED_BY, etc.
      userStampFields.forEach((fieldName) => {
        if (dataToPost[fieldName] != this.ds.userInfo.name)
          dataToPost[fieldName] = this.ds.userInfo.name;
      });
    }
    if (dateStampFields) {
      // set value of fields to contain the current date
      // name as enumerated in the calling (add/edit/delete) component
      // eg. CREATED_DATE, UPDATED_DATE, etc.
      dateStampFields.forEach(
        (fieldName) => (dataToPost[fieldName] = this.ds.dateStampString)
      );
    }

    // scan all date type data in changed and make sure that the
    // values are in YYYY-MM-ddThh:mm:ss format

    // get container table of the row object
    if (tbl)
      // loop through all changed fields and reformat
      // date field values if it contains the actual date object
      for (const fieldName in dataToPost) {
        if (tbl.GetColumnType(fieldName) == 'Date') {
          // make sure that if the value in changed object
          // is an object type, reformat it accordingly
          if (typeof dataToPost[fieldName] == 'object')
            // field contains true date object
            dataToPost[fieldName] = this.ds.dateToString(dataToPost[fieldName]);
        }
      } // end for for fieldName in changed

    // if revision field name is specified, up-rev the value
    if (revField) dataToPost[revField] = row[revField] + 1;

    // initialize form data variable
    const formData = { __config__: { useCommonNewKey: true } };

    // populate formData main object
    formData[tableCode] = [dataToPost];

    // handle other post parameters passed through extraPostParam
    if (extraPostParam) {
      // this is additional post instruction parameters that will
      // be requested together with the main table row post instruction.
      // parameter value has the following format
      /*
       *  {tableCode1:Array<<record data1>[,record data2][,record data#]>},
       *  {tableCode2:Array<<record data1>[,record data2][,record data#]>},
       *  {tableCode#:Array<<record data1>[,record data2][,record data#]>},
       */

      for (const key in extraPostParam) formData[key] = extraPostParam[key];
    }

    // get observable post object
    console.log('\nPost Datat (formData):', formData);
    const obs = this.ds.Post(formData);

    if (obs) {
      // send progress feedback to client
      this.dataSource.openSnackBar(msgProgress, 'X', 1000);

      const subs = obs.subscribe(
        (data) => {
          subs.unsubscribe();

          // call update client
          this.UpdateClient({
            row: row,
            data: dataToPost,
            recolorTree: recolorTree,
            requeryGrid: requeryGrid,
            requeryDetails: requeryDetails,
            assetId: assetId,
          });

          // call onSuccess listener
          if (onSuccess) onSuccess(data);

          // close dialog after a successful posting
          if (dialogRef) dialogRef.close({ mode: 'saved' });

          this.dataSource.openSnackBar(msgSuccess, 'X', 1500);
        },
        (err) => {
          subs.unsubscribe();

          errorMessage = err.message;
          this.dataSource.openSnackBar(eval(msgError), 'X', 5000);

          // call onSuccess listener
          if (onError) onError(err);
        }
      );
    }
  }

  ResetTreeStatus() {
    this.ds.treeColorData = null; // will trigger re-fetching of tree color data
    this.treeView.ResetStatus(); // will set all status to value that will allow re-assignment of color
  }

  UpdateClient(args: {
    row?: any;
    data?: any;
    recolorTree?: boolean;
    requeryGrid?: boolean;
    requeryDetails?: boolean;
    assetId?: number;
  }) {
    const {
      row,
      data,
      recolorTree,
      requeryGrid,
      requeryDetails,
      assetId,
    } = args;

    const tbl = row ? row.parentTable : null;

    if (!tbl && !requeryGrid) return; // table definition must exist in order to perform client update....

    const keyName = tbl ? tbl.keyName : null;

    if (requeryGrid) {
      // emulate tree click by setting current node on the tree
      // if this is called, there is no need to perform field level update

      const assetLookup = row.XTRA.assetLookup;
      console.log('\nassetLookup:', assetLookup, '\nassetId:', assetId);

      if (assetId) {
        const searchLocation = assetLookup.find((a) => a.key == assetId);
        console.log(
          '\nassetLookup:',
          assetLookup,
          '\nsearchLocation:',
          searchLocation
        );
        if (searchLocation)
          this.treeView.SetCurrentNode(searchLocation.location);
      }
    } else if (data) {
      const gridRow = this.mainGrid.currentRow;

      if (gridRow) {
        if (
          data[keyName] == row[keyName] &&
          data[keyName] == gridRow[keyName]
        ) {
          for (let field in data) {
            if (field != keyName) {
              console.log(`${field}: ${data[field]}`);
              row[field] = data[field];
              gridRow[field] = data[field];
            }
          }

          // call data scatter for all details tab forms
          this.mainFormCollection.forEach((f) => f.Scatter(true));

          // clear grod row cached values
          gridRow.ClearCachedInfo();
        }
        console.log('\nRow:', row, '\nGridRow:', gridRow, '\nData:', data);
      }
    }

    if (recolorTree)
      // get new colorset and paint the tree
      setTimeout(() => this.ResetTreeStatus(), 10);

    if (requeryDetails && row) {
    }
  }

  // ResetData(form: FormGroup, row: any) {
  //   if (!this.DataChanged(form, row)) return;
  //   this.dataSource
  //     .Confirm(
  //       'Confirm Reset',
  //       'Resetting will discard all changes made and will restore original values.<br/><br/>Do you want to continue?',
  //       { width: 550, height: 230, labelYes: 'Yes', labelNo: 'No' }
  //     )
  //     .subscribe((result) => {
  //       if (result.mode == 'yes') {
  //         for (const field in form.controls) {
  //           // 'field' is a string
  //           const ctrl: AbstractControl = form.get(field); // 'control' is a FormControl
  //           if (ctrl) if (row[field] != undefined) ctrl.setValue(row[field]);
  //         }
  //         this.dataSource.openSnackBar(
  //           'Restored original field values reset.',
  //           'Close',
  //           2000
  //         );
  //       }
  //     });
  // }

  GetGridLookup(lookupName: string): Array<any> {
    const lkps = this.moduleState.gridSourceLookups;
    if (!lkps) return [];
    const lkp = this.moduleState.gridSourceLookups[lookupName];
    if (!lkp) return;
    let ret: Array<any> = [];
    for (let key in lkp) {
      ret.push({ key: key, text: lkp[key] });
    }
    return ret;
  }

  public GridRowClickLocal(data: any): void {
    /*interface function*/
  }

  // delay before setting loading mask
  private _loadingTimeout: number = 200;

  // loading mask handle
  private _loadingTimeoutHandle: any = null;

  ResetCurrentRow(row?: any) {
    // sets current row in the grid and retrieves actual record to scatter on data form
    if (!row) {
      this.currentRow = null;
      this._sourceRow = this.currentRow;
    } else if (this.mainGrid) {
      this.mainGrid.currentRow = row;
      //this.GridRowClick({ row: row, e: null });
      this.GridRowClick(row);
    }
  }

  GridRowClick(row?: any, forceExtract?: boolean) {
    // if row is not supplied but moduleState.currentRow exist, use it as row parameter
    if (!row && this.moduleState.currentRow) row = this.moduleState.currentRow;

    if (!row) return;

    // get table object definition
    const tbl: any = row.parentTable;
    // table code to be used as the primary table alias
    let tableCode: string = tbl.tableCode;
    let includedFields: string = '';

    const keyName = tbl.keyName;
    const key = row[keyName];

    //if row is already in the buffer array,
    // set to buffer record to current row and exit this method
    if (!forceExtract) {
      const bufIndex = this.mainRecordsBuffer.findIndex(
        (br) => br[keyName] == key
      );

      if (bufIndex != -1) {
        // triggers form scatter
        this.currentRow = this.mainRecordsBuffer[bufIndex];
        this._sourceRow = this.currentRow;
        console.log('From buffer ...');
        this.GridRowClickLocal(null);
        return;
      }
    }

    if (this.assetField)
      // if asset fieldname is defined, get asset information infomation
      // from related tables (ie. asset code, desctription)
      this.ExtractCurrentRow(key, row[this.assetField]);

    // console.log(
    //   `GridRowClick MODULE STATE (${this.moduleId}) : `,
    //   this.moduleState,
    //   'this.mainGrid.currentRow:',
    //   this.mainGrid.currentRow,
    //   'this.mainGrid.gridCurrentRowIndex:',
    //   this.mainGrid.moduleState ? this.mainGrid.moduleState.gridCurrentRow : null
    // );
  }

  ExtractCurrentRow(key: any, assetId: number) {
    const tbl = this.sourceTable;
    const keyName = tbl.keyName;
    const tableCode = tbl.tableCode;

    // check if record is buffered and remove it if it is.
    const bufIndex = this.mainRecordsBuffer.findIndex(
      (br) => br[keyName] == key
    );
    if (bufIndex != -1) this.mainRecordsBuffer.splice(bufIndex, 1);

    this.suppressPendingRequestFlag = true;

    // set isDataLoading flag for all mainForm subforms to true to display wating status
    this._loadingTimeoutHandle = setTimeout(() => {
      this.mainFormCollection.forEach((f) => (f.isDataLoading = true));
      this._isRowWaiting = true;
    }, this._loadingTimeout);

    this.ds.Get(
      [
        {
          // append table relationship to node attrib
          code: tableCode + `|-node,${this.assetField},REC_TAG;`,
          key: key,
          // get all fields from base table and asset node information
          includedFields: tableCode + '.*`NODE_ID`NODE_DESC',
          snapshot: true,
        },
        {
          // get tre_nod_loc on a separate sub request because this is faster than
          // relating the struct table to the current selected data row
          code: 'tre',
          filter: `{TRE_DAT_TAG|${assetId}}^{TRE_DAT_TYPE|${this.ds.currentTreeId}}`,
          includedFields: 'TRE_NOD_LOC',
          snapshot: true,
        },
      ],
      {
        onSuccess: (e) => {
          if (e.processed.data[0].length) {
            // set details current row data
            this.currentRow = e.processed.data[0].length
              ? e.processed.data[0][0]
              : null;

            // set current row's tree location position data
            this.currentRow.XTRA = {
              TRE_NOD_LOC: e.processed.data[1]
                ? e.processed.data[1].length
                  ? e.processed.data[1][0]['TRE_NOD_LOC']
                  : null
                : null,
            };

            this.currentRow.XTRA = {
              // build asset lookup's initial element within the extracted row
              assetLookup: [
                {
                  key: this.currentRow[this.assetField],
                  code: this.currentRow.XTRA.NODE_ID,
                  text: this.currentRow.XTRA.NODE_DESC,
                  location: this.currentRow.XTRA.TRE_NOD_LOC,
                },
              ],
            };
          }

          // add currentRow to buffer
          this.mainRecordsBuffer.push(this.currentRow);

          // triggers form scatter
          this._sourceRow = this.currentRow;

          // call module's local override function
          this.GridRowClickLocal(e);

          // if timeout for loading mask is not reached before data is received,
          // cancel timeout set!
          if (this._loadingTimeoutHandle)
            clearTimeout(this._loadingTimeoutHandle);

          // set all isDataLoading flag to false
          this.mainFormCollection.forEach((f) => (f.isDataLoading = false));

          this._isRowWaiting = false;
          this.suppressPendingRequestFlag = false;
        },
        onError: (err) => {
          console.log('Error getting single row data...');
        },
      }
    );
  }

  public isCurrentRow(row: any): boolean {
    if (!this.currentRow) return false;
    //return ITS_JUST_ANGU
  }

  // onChanges(): void {
  //   this.mainFormObject.valueChanges.subscribe((val) => {
  //     console.log('ON CHANGES!', val);
  //   });
  // }

  SaveRecord(result: any) {
    console.log('Save updates:', result);

    return;

    const formVal = this.mainFormObject.value;
    let postValues = {};
    let willPOST: boolean = false;
    for (let field in formVal) {
      if (formVal[field] != this.currentRow[field]) {
        postValues[field] = formVal[field];
        this.currentRow[field] = postValues[field];
        willPOST = true;
      }
    }

    // refresh display, call scatter method for each form/subform
    // with recordChanged flag to reset fieldsInitialized parameter set to true
    if (willPOST) {
      // call POST method to save postValues
      console.log('POST Values: ', postValues);

      // scatter values on successful posting
      this.mainFormCollection.forEach((f) => f.Scatter(true));
    }
  }

  CancelUpdate() {
    return;
    const formVal = this.mainFormObject.value;

    let patchValues = {};
    for (let field in formVal) {
      if (formVal[field] != this.currentRow[field])
        patchValues[field] = this.currentRow[field];
    }

    this.mainFormObject.patchValue(patchValues);
  }
}
