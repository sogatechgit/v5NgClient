import { ILookupParams } from './../../mod/app-params.model';
import { IFieldDefParam } from './../../mod/app-common.classes';
import { AppFormAComponent } from './../app-form-a/app-form-a.component';
import { AppCommonMethodsService } from './../../svc/app-common-methods.service';
import { AppDataset } from './../../../svc/app-dataset.service';

import { RiskMatrixComponent } from './../risk-matrix/risk-matrix.component';
import {
  DataGridOption,
  DataGridColumn,
} from './../data-grid/data-grid.component';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ColumnInfo } from '../../mod/app-column.model';
import {
  IFilterOperator,
  FilterDataType,
  IFieldExpression,
} from '../../mod/app-common.classes';
import * as moment from 'moment/moment';

@Component({
  selector: 'app-filter-parameters',
  templateUrl: './filter-parameters.component.html',
  styleUrls: ['./filter-parameters.component.scss'],
})
export class FilterParametersComponent implements OnInit, AfterViewInit {
  @Input() dateFormat: string = 'DD-MMM-YYYY';
  @Input() dateTimeFormat: string = 'DD-MMM-YYYY, hh:mm:ss a';

  @ViewChild('matrix') matrix: RiskMatrixComponent;
  @ViewChild('detailForm') form: AppFormAComponent;

  public selectedValues: Array<{ severity: number; likelihood: number }> = [];

  public COMMON_TYPES: number =
    FilterDataType.TEXT | FilterDataType.DATE | FilterDataType.NUMBER;
  public TEXT_OR_NUMBER: number =
    FilterDataType.TEXT | FilterDataType.NUMBER | FilterDataType.ASSET;

  private _ready: boolean = false;
  public get ready(): boolean {
    return this._ready;
  }

  public get months(): Array<any> {
    return this.apiCommon.MONTHS();
  }

  private _dataType: number = null;
  public get dataType(): number {
    if (this._dataType == null) {
      const col = this.dataColumn;

      console.log(
        '\ndataType: ',
        col,
        this.ColumnType,
        'this.columnFieldName:',
        this.columnFieldName,
        ', data:',
        this.data
      );
      /*
          if (!this.columnFieldName) return this._ColumnType;
    if (!this.data) return this._ColumnType;
    if (!this.data.table) return this._ColumnType;
      */

      if (col) {
        if (col.filterType != undefined) {
          this._dataType = col.filterType;
        } else if (col.matrixData) {
          this._dataType = FilterDataType.MATRIX;
        } else {
          switch (this.ColumnType) {
            case 'string':
              this._dataType = FilterDataType.TEXT;
              break;
            case 'Date':
              this._dataType = FilterDataType.DATE;
              break;
            case 'number':
              this._dataType = FilterDataType.NUMBER;
              break;
            default:
              this._dataType = FilterDataType.TEXT;
          }
        }
      } else {
        this._dataType = FilterDataType.TEXT;
      }
    }
    return this._dataType;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<FilterParametersComponent>
  ) {}

  public get Lookups(): any {
    return this.data ? this.data.sourceLookups : null;
  }

  public optrs: Array<IFilterOperator> = [
    {
      prmt: 'Equal To ...',
      optr: 'eq',
      apsw: this.COMMON_TYPES | FilterDataType.BOOLEAN | FilterDataType.ASSET,
    },
    {
      prmt: 'Not Equal To ...',
      optr: 'neq',
      apsw: this.COMMON_TYPES | FilterDataType.BOOLEAN | FilterDataType.ASSET,
    },
    // {
    //   prmt: 'In ...',
    //   optr: 'in',
    //   apsw: this.COMMON_TYPES | FilterDataType.ASSET,
    // },
    // {
    //   prmt: 'Not In ...',
    //   optr: 'nin',
    //   apsw: this.COMMON_TYPES | FilterDataType.ASSET,
    // },

    { prmt: 'Less Than ...', optr: 'lt', apsw: this.TEXT_OR_NUMBER },
    {
      prmt: 'Less Than or Equal To ...',
      optr: 'lte',
      apsw: this.TEXT_OR_NUMBER,
    },
    { prmt: 'Greater Than ...', optr: 'gt', apsw: this.TEXT_OR_NUMBER },
    {
      prmt: 'Greater Than or Equal To ...',
      optr: 'gte',
      apsw: this.TEXT_OR_NUMBER,
    },
    { prmt: 'Between ...', optr: 'btw', apsw: this.TEXT_OR_NUMBER },
    { prmt: 'Outside ...', optr: 'nbtw', apsw: this.TEXT_OR_NUMBER },

    { prmt: 'Before ...', optr: 'lt', apsw: FilterDataType.DATE },
    { prmt: 'On or Before ...', optr: 'lte', apsw: FilterDataType.DATE },
    { prmt: 'After ...', optr: 'gt', apsw: FilterDataType.DATE },
    { prmt: 'On or After ...', optr: 'gte', apsw: FilterDataType.DATE },
    { prmt: 'Within ...', optr: 'btw', apsw: FilterDataType.DATE },
    { prmt: 'Not Within ...', optr: 'nbtw', apsw: FilterDataType.DATE },

    {
      prmt: 'Contains ...',
      optr: 'lk',
      apsw: FilterDataType.TEXT | FilterDataType.ASSET,
    },
    {
      prmt: 'Begins With ...',
      optr: 'bgw',
      apsw: FilterDataType.TEXT | FilterDataType.ASSET,
    },
    {
      prmt: 'Ends With ...',
      optr: 'enw',
      apsw: FilterDataType.TEXT | FilterDataType.ASSET,
    },
  ];

  private _validOperators: Array<IFilterOperator> = null;
  public get validOperators(): {} {
    if (this._validOperators == null) {
      let tmpValid: Array<IFilterOperator> = [];
      this.optrs.forEach((o) => {
        if (o.apsw & this.dataType) tmpValid.push(o);
      });
      this._validOperators = tmpValid;
    }
    return this._validOperators;
  }

  private _customList: Array<any> = [];
  public get customList(): Array<any> {
    // if (!this.data) return [];
    // if (!this.data.customList) return [];
    // return this.data.customList;
    return this._customList;
  }

  public selectAll: number = -1;

  public formData: FormGroup = new FormGroup({});

  public columnData: Array<any> = [];

  keyUp(e: any) {
    if (e.key == 'Enter') if (e.target.value) this.ApplyFilter();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this._ready = true;
    }, 200);
  }
  ngOnInit(): void {
    this.formData = this.EmptyForm;

    if (this.dataColumn.filterData) {
      // if filterData is existing....
      this.formData.patchValue(this.dataColumn.filterData.value);
      if (this.isMatrix) {
        const frmArray = this.dataColumn.filterData.get(
          'matrixValues'
        ) as FormArray;
        if (frmArray) {
          this.selectedValues = [];
          frmArray.value.forEach((mtx) => this.selectedValues.push(mtx));
        }
      } else if (this.isDate) {
        console.log(
          '\nBefore parseDate, this.dataColumn.filterSelection:',
          this.dataColumn.filterSelection
        );
        this.parseDate();
      }
    } // if filterData is existing....
  }

  private get dataColumnDateFilterSelection(): Array<any> {
    if (!this.dataColumn.filterSelection) return [];
    return this.dataColumn.filterSelection;
  }

  private _dateList: Array<string> = null;
  private get dateList(): Array<string> {
    if (this._dateList == null) {
      if (!this.customList) this._dateList = [];
      else {
        let tmp: Array<string> = [];
        this.customList.forEach((item) => tmp.push(item));
        this._dateList = tmp;
      }
    }

    return this._dateList;
  }

  // showCustomList(data) {
  //   if(!this._SelectionList){
  //     let tmp:Array<any> = [];

  //     this._SelectionList
  //   }
  //   // this._SelectionList = data;
  //   //console.log('showCustomList:', data);
  // }

  parseDate() {
    // normalize data
    const tmp: Array<any> = [];
    this.dateList.forEach((dt) => {
      tmp.push({
        year: dt.substr(0, 4),
        month: dt.substr(5, 2),
        day: dt.substr(8, 2),
      });
    });

    const dateSelection = this.dataColumnDateFilterSelection;
    console.log('parseDate dateSelection:', dateSelection);

    // defaul item select value, ie. selected (-1) if dateSelection is empty
    const defSelect: number = dateSelection.length ? 0 : -1;

    const tmpArr = this.groupBy(tmp, 'year');

    tmpArr.forEach((yr) => {
      yr['par'] = null;
      yr['exp'] = false;
      yr['sel'] = defSelect;
      yr['mos'] = this.groupBy(yr['data'], 'month');
      yr['mos'].forEach((mo) => {
        mo['exp'] = false;
        mo['sel'] = defSelect;
        mo['par'] = yr;
        mo['days'] = this.groupBy(mo['data'], 'day');
        mo['days'].forEach((day) => {
          day['par'] = mo;
          if (defSelect == 0) {
            const d = this.findDateFromHeirarchy(dateSelection, day);
            if (d) day['sel'] = d['sel'];
          } else {
            day['sel'] = defSelect;
          }
        });
      });
    });

    if (defSelect == 0) {
      // normalize parent checkbox selection display

      tmpArr.forEach((year: any) => {
        year.mos.forEach((month) => {
          month['sel'] = this.isDaySelStat(month, false, true)
            ? -1
            : this.isDaySelStat(month, true, true)
            ? 0
            : 1;
          if (month['sel'] == 1) month['exp'] = true;
        });
        year['sel'] = this.isMoSelStat(year, false, true)
          ? -1
          : this.isMoSelStat(year, true, true)
          ? 0
          : 1;
        if (year['sel'] == 1) year['exp'] = true;
      });

      this.selectAll = this.isYrSelStat(false, true, tmpArr)
        ? -1
        : this.isYrSelStat(true, true, tmpArr)
        ? 0
        : 1;
    }
    this.dateHeirarchy = tmpArr;
  }

  findDateFromHeirarchy(dates: Array<any>, day: any): any {
    const mo: any = day.par;
    const yr: any = mo.par;

    // find year
    const year = dates.find((y) => y.name == yr.name);
    // find month
    if (year) {
      const month = year.mos.find((m) => m.name == mo.name);
      if (month) {
        const date = month.days.find((d) => d.name == day.name);
        if (date) return date;
      }
    }
    return null;
  }

  dateCheckClass(node: any): any {
    let sw: number = node ? node.sel : this.selectAll;

    return {
      far: sw != 1,
      fas: sw == 1,
      'fa-square': sw == 1 || sw == 0,
      'fa-check-square': sw == -1,
    };
  }

  selectionCheckClass(item: any): any {
    let sw: number = item ? item.sel : this.selectAll;

    return {
      far: sw != 1,
      fas: sw == 1,
      'fa-square': sw == 1 || sw == 0,
      'fa-check-square': sw == -1,
    };
  }

  selectionCheck(item: any) {
    if (item) {
      item.sel = !item.sel ? -1 : 0;
      const sel = this.SelectionList.find((i) => i.sel == -1);
      const unsel = this.SelectionList.find((i) => i.sel == 0);
      if (sel && unsel) this.selectAll = 1;
      else if (sel) this.selectAll = -1;
      else this.selectAll = 0;
    } else {
      this.selectAll = this.selectAll != -1 ? -1 : 0;
      this.SelectionList.forEach((item) => (item.sel = this.selectAll));
    }
  }

  datePMClick(node: any) {
    node.exp = !node.exp;
  }

  dateCheck(node: any, setChildren?: boolean, setParent?: boolean) {
    if (setChildren == undefined) setChildren = true;
    if (setParent == undefined) setParent = setChildren;

    if (node == null) {
      // Select All selected
      // select/unselect all nodes

      if (this.isYrSelStat(false, true)) {
        // all selected, unselect all
        this.selectAll = 0;
        if (setChildren) this.setAllYear(true);
      } else {
        // all unselected or partly selected, unselect all
        this.selectAll = -1;
        if (setChildren) this.setAllYear();
      }
    } else if (node.mos) {
      // year selected
      if (this.isMoSelStat(node, false, true)) {
        // all selected, unselect all months
        node.sel = 0;
        if (setChildren) this.setAllMonth(node, true);
      } else {
        // all selected, unselect all months
        node.sel = -1;
        if (setChildren) this.setAllMonth(node);
      }

      if (setParent) this.setParentStat(node);
    } else if (node.days) {
      // month selected
      if (this.isDaySelStat(node, false, true)) {
        // all selected, unselect all months
        node.sel = 0;
        if (setChildren) this.setAllDay(node, true);
      } else {
        // all selected, unselect all months
        node.sel = -1;
        if (setChildren) this.setAllDay(node);
      }

      if (setParent) this.setParentStat(node);
    } else {
      // day selected
      node.sel = node.sel == -1 ? 0 : -1;
      if (setParent) this.setParentStat(node);
    }
  }

  setParentStat(node: any) {
    let par: any;
    let item = node;
    while (item) {
      par = item.par;

      // execute code
      if (par == null) {
        // root/selectAll,
        // year node, parent node is selectAll
        if (this.isYrSelStat(true, true))
          // all unselected
          this.selectAll = 0;
        else if (this.isYrSelStat(false, true))
          // all selected
          this.selectAll = -1;
        else this.selectAll = 1;
      } else if (item.days) {
        // month node, parent node is a year
        if (this.isMoSelStat(par, true, true))
          // all unselected
          par.sel = 0;
        else if (this.isMoSelStat(par, false, true))
          // all selected
          par.sel = -1;
        else par.sel = 1;
      } else {
        // day node, parent node is a month
        if (this.isDaySelStat(par, true, true))
          // all unselected
          par.sel = 0;
        else if (this.isDaySelStat(par, false, true))
          // all selected
          par.sel = -1;
        else par.sel = 1;
      }

      // make the item as parent node;
      item = par;
    }
  }

  private setAllDay(mo: any, noSel?: boolean) {
    if (noSel == undefined) noSel = false;
    mo.sel = noSel ? 0 : -1;
    mo.days.forEach((day) => (day.sel = noSel ? 0 : -1));
  }

  private setAllMonth(yr: any, noSel?: boolean) {
    if (noSel == undefined) noSel = false;
    yr.sel = noSel ? 0 : -1;
    yr.mos.forEach((mo) => this.setAllDay(mo, noSel));
  }
  private setAllYear(noSel?: boolean) {
    if (noSel == undefined) noSel = false;
    this.dateHeirarchy.forEach((yr) => this.setAllMonth(yr, noSel));
  }

  private isDaySelStat(mo: any, noSel?: boolean, allMode?: boolean): boolean {
    if (noSel == undefined) noSel = false;
    if (allMode == undefined) allMode = false;

    let ret: boolean = false;
    let ctr: number = 0;
    mo.days.forEach((day) => {
      if (allMode) {
        if ((noSel && day.sel == 0) || (!noSel && day.sel == -1)) ctr++;
      } else {
        if (ret) return;
        if ((noSel && day.sel == 0) || (!noSel && day.sel == -1)) ret = true;
      }
    });
    if (allMode) ret = ctr == mo.days.length;
    return ret;
  }

  private isMoSelStat(yr: any, noSel?: boolean, allMode?: boolean): boolean {
    if (noSel == undefined) noSel = false;
    if (allMode == undefined) allMode = false;
    let ret: boolean = false;
    let ctr: number = 0;
    yr.mos.forEach((mo) => {
      if (allMode) {
        if (this.isDaySelStat(mo, noSel, allMode)) ctr++;
      } else {
        if (ret) return;
        ret = this.isDaySelStat(mo, noSel, allMode);
      }
    });
    if (allMode) ret = ctr == yr.mos.length;
    return ret;
  }

  private isYrSelStat(
    noSel?: boolean,
    allMode?: boolean,
    heirarchy?: any
  ): boolean {
    if (noSel == undefined) noSel = false;
    if (allMode == undefined) allMode = false;
    let ret: boolean = false;
    let ctr: number = 0;

    if (heirarchy == undefined) heirarchy = this.dateHeirarchy;

    heirarchy.forEach((yr) => {
      if (allMode) {
        if (this.isMoSelStat(yr, noSel, allMode)) ctr++;
      } else {
        if (ret) return;
        ret = this.isMoSelStat(yr, noSel, allMode);
      }
    });
    if (allMode) ret = ctr == heirarchy.length;
    return ret;
  }

  private _dateHeirarchy: Array<any> = [];
  public get dateHeirarchy(): Array<any> {
    return this._dateHeirarchy;
  }

  public set dateHeirarchy(value: Array<any>) {
    this._dateHeirarchy = value;
  }

  operatorSelected(op: IFilterOperator) {
    this.formData.get('operatorValue').setValue(op.optr);
    this.formData.get('operatorPrompt').setValue(op.prmt);
  }

  groupBy(
    arr,
    key,
    objLookup?,
    lookupKey?: string,
    lookupFields?: Array<string>,
    sortField?: string
  ): Array<object> {
    var newArr = [],
      types = {},
      newItem,
      i,
      j,
      cur;
    for (i = 0, j = arr.length; i < j; i++) {
      cur = arr[i];
      if (!(cur[key] in types)) {
        types[cur[key]] = { type: cur[key], data: [] };
        newArr.push(types[cur[key]]);
      }
      types[cur[key]].data.push(cur);
    }

    if (objLookup != undefined) {
      if (newArr) {
        newArr.forEach((item) => {
          let obj = objLookup.find(
            (lkpItem) => item['type'] == lkpItem[lookupKey ? lookupKey : 'id']
          );
          if (obj) {
            item['name'] = obj['name'] != undefined ? obj['name'] : 'unknown';
          } else {
            item['name'] = 'unknown';
          }
          if (lookupFields != undefined) {
            // attach all fields from the lookup item to the current item of the input array
            lookupFields.forEach((field) => {
              if (obj) {
                item[field] = obj[field];
              } else {
                item[field] = null;
              }
            });
          }
        });
      }
      if (sortField != undefined && this.sortBy != null) {
        this.sortBy(newArr, sortField);
      } else {
        this.sortBy(newArr, 'name');
      }
    } else {
      newArr.forEach((item) => {
        item['name'] = item['type'];
      });
    }

    return newArr;
  }

  sortBy(arr: Array<any>, key: string, desc?: boolean) {
    if (arr == undefined) return;

    if (desc == undefined) desc = false;

    if (desc) {
      arr.sort((a, b) => {
        return a[key] < b[key] ? 1 : b[key] < a[key] ? -1 : 0;
      });
    } else {
      arr.sort((a, b) => {
        return a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0;
      });
    }
  }

  public displayDate(fieldName: string, fieldName2?: string): string {
    const ctrl = this.formData.get(fieldName);
    if (!ctrl) return null;
    //return new Date(ctrl.value);
    if (!ctrl.value) return null;

    const dt = new Date(ctrl.value);
    const fmt =
      dt.getSeconds() != 0 || dt.getMinutes() != 0
        ? this.dateTimeFormat
        : this.dateFormat;

    let ret: string = moment(dt).format(fmt);

    if (fieldName2) {
      const ctrl2 = this.formData.get(fieldName2);
      if (ctrl2)
        if (ctrl2.value) {
          const dt2 = new Date(ctrl2.value);
          ret += ' to ' + moment(dt2).format(fmt);
        }
    }

    return ret;
  }

  public get dataGridOption(): DataGridOption {
    if (!this.data) return null;
    return this.data.options;
  }

  public get isDate(): boolean {
    return this.dataType == FilterDataType.DATE;
  }

  public get isCommon(): boolean {
    const res: number = this.dataType & this.COMMON_TYPES;
    return res != 0;
  }

  public get isTextOrNumber(): boolean {
    const res: number = this.dataType & this.TEXT_OR_NUMBER;
    return res != 0;
  }
  public get isNumber(): boolean {
    const res: number = this.dataType & FilterDataType.NUMBER;
    return res != 0;
  }

  public get isMatrix(): boolean {
    return this.dataColumn.matrixData ? true : false;
  }

  RiskClick(e: any) {
    const { severity, likelihood } = e;
  }

  GetSearchValue(value: any): any {
    if (
      this.isNumber &&
      !this.dataColumn.displayField &&
      value != null &&
      value != ''
    ) {
      // if data column is a true numeric field and not
      // a lookup type field
      return isNaN(value) ? null : +value;
    } else {
      return value;
    }
  }

  public get operatorValue(): string {
    return this.getFormControlValue('operatorValue');
  }

  public get searchValues(): FormArray {
    return this.getFormControlValue('searchValues');
  }

  public get searchValue1(): any {
    return this.getFormControlValue('searchValue1');
  }
  public get searchValue2(): any {
    return this.getFormControlValue('searchValue2');
  }

  public get searchDateValue(): any {
    return this.getFormControlValue('dateValue');
  }

  public get searchDateStart(): any {
    return this.getFormControlValue('dateStart');
  }
  public get searchDateEnd(): any {
    return this.getFormControlValue('dateEnd');
  }

  private getFormControlValue(controlName: string): any {
    const ctrl = this.formData.get(controlName);
    return ctrl ? ctrl.value : null;
  }

  public get withSecondValue(): boolean {
    const optr = this.formData.get('operatorValue');
    if (!optr) return false;
    return !this.isIn && (optr.value == 'btw' || optr.value == 'nbtw');
  }

  public get isIn(): boolean {
    const optr = this.formData.get('operatorValue');
    if (!optr) return false;
    return optr.value == 'in' || optr.value == 'nin';
  }
  public get isRange(): boolean {
    const optr = this.formData.get('operatorValue');
    if (!optr) return false;
    return optr.value == 'btw' || optr.value == 'nbtw';
  }

  private _columnCaption: string = null;
  public get columnCaption(): string {
    if (this._columnCaption != null) return this._columnCaption;
    this._columnCaption = '';

    if (this.dataColumn) this._columnCaption = this.dataColumn.caption;

    return this._columnCaption;
  }

  public get dataColumn(): DataGridColumn {
    if (!this.data) return null;
    if (!this.data.parent) return null;
    return this.data.parent.filteredColumn;
  }

  private _columnFieldName: string = null;
  public get columnFieldName(): string {
    if (this._columnFieldName != null) return this._columnFieldName;
    this._columnFieldName = '';
    if (this.data) this._columnFieldName = this.data.column.fieldName;
    return this._columnFieldName;
  }

  public get ds(): AppDataset {
    if (!this.data) return null;
    if (!this.data.parent) return null;
    return this.data.parent.dataSet;
  }

  public get apiCommon(): AppCommonMethodsService {
    if (!this.ds) return null;
    return this.ds.apiCommon;
  }

  private get BaseFilter(): string {
    if (!this.ds) return '';
    return this.data.parent.dataSet.BaseFilter;
  }

  private _ColumnType: string = null;
  public get ColumnType(): string {
    if (this._ColumnType != null) return this._ColumnType;

    this._ColumnType = 'unknown';

    if (!this.columnFieldName) return this._ColumnType;
    if (!this.data) return this._ColumnType;
    if (!this.data.table) return this._ColumnType;

    const col: ColumnInfo = this.data.table.columns.find(
      (c) => c.name == this.columnFieldName
    );
    if (col) this._ColumnType = col.type;

    return this._ColumnType;
  }

  public get filterExpression(): string {
    //const fmt="`{${this.dataColumn|${ret}|${this.}}`"

    //let ret:string = this.operatorValue;
    //return `{${this.dataColumn.fieldName|${this.operatorValue}|}`;

    let optr = this.operatorValue;

    let v1 = this.searchValue1;
    let v2 = this.searchValue2;

    if (optr == 'bgw') {
      optr = 'lk';
      v1 = v1 + '~';
    } else if (optr == 'enw') {
      optr = 'lk';
      v1 = '~' + v1;
    } else if (optr == 'lk') {
      v1 = '~' + v1 + '~';
    }

    return `{${this.dataColumn.fieldName}|${optr}|${v1}${
      optr == 'btw' || optr == 'nbtw' ? '^' + v2 : ''
    }}`;

    //${this.searchValues.value}
  }

  SortAscending() {
    this.sortAscending = !this.sortAscending;
    if (this.sortAscending) this.sortDescending = !this.sortAscending;
  }
  SortDescending() {
    this.sortDescending = !this.sortDescending;
    if (this.sortDescending) this.sortAscending = !this.sortDescending;
  }

  public get sortAscending() {
    return this.formData.get('sortAscending').value;
  }
  public set sortAscending(value: boolean) {
    this.formData.get('sortAscending').setValue(value);
  }

  public get sortDescending() {
    return this.formData.get('sortDescending').value;
  }
  public set sortDescending(value: boolean) {
    this.formData.get('sortDescending').setValue(value);
  }

  ApplyFilter(args?: {
    clear?: boolean;
    saveOnly?: boolean;
    exclCurr?: boolean;
    dataType?: number;
    clearAllFilter?: boolean;
    clearSort?: boolean;
    clearAll?: boolean;
  }) {
    if (!args) args = {};

    /**
     * Calls:
     *   ApplyFilter() - Save and Apply
     *   ApplyFilter({saveOnly:true}) - Save Only
     *   ApplyFilter({clear:true}) - Clear filter for the current column
     *   ApplyFilter({clearAllFilter:true}) - Clear filter for all columns
     *   ApplyFilter({clearSort:true}) - Remove sort order on all columns ...
     *   ApplyFilter({clearAll:true}) - Clear all filters and sort orders ...
     */

    let {
      clear,
      saveOnly,
      exclCurr,
      dataType,
      clearAllFilter,
      clearSort,
      clearAll,
    } = args;

    if (!clear) clear = false;
    if (!saveOnly) saveOnly = false;
    if (!exclCurr) exclCurr = false;

    if (this.data.parent)
      if (this.data.parent.ApplyFilter) {
        // process filter expression(s)
        if (!exclCurr)
          // Record filter only if not getting custom selection list
          this.RecordFilter(clear, clearAllFilter, clearSort, clearAll);

        this.data.parent.ApplyFilter(
          this.dataColumn,
          clear,
          saveOnly,
          exclCurr,
          dataType,
          (data) => {
            this.listInProgress = false;
            if (this.isDate) {
              this._customList = data;
              this._dateList = null; // triggers re-population of _dateList
              this.parseDate();
            } else {
              let tmp: Array<any> = [];
              data.forEach((item) => {
                tmp.push({ text: item, sel: 0 });
              });
              this.selectAll = 0;
              this.sortBy(tmp, 'text');
              this._SelectionList = tmp;
            }
          }
        );
      } else console.log('ApplyFilter event not defined');
    else console.log('ApplyFilter event not defined');

    if (!exclCurr) this.dialogRef.close();
  }
  CancelFilter() {
    this.dialogRef.close();
  }

  public cellTip: string = null;
  public listRowHeight: number = 22;
  OnCellMouse(event: any) {
    const eType = event.type;
    const target = event.srcElement;
    if (eType == 'mouseenter') {
      if (target) {
        if (target.scrollWidth > target.offsetWidth)
          this.cellTip = target.innerHTML;
      } else {
        this.cellTip = null;
      }
    } else if (eType == 'mouseleave') {
      this.cellTip = null;
    }
  }

  panelOpen() {
    console.log('\nFilter panel open ... this.GetList()');
    this.GetList();
  }
  panelClosed() {}

  public get isPanelExpanded(): boolean {
    return this.dataColumnDateFilterSelection.length != 0;
  }

  public listInProgress: boolean = false;
  GetList() {
    this.listInProgress = true;
    // no clear, save only, exclude current field
    setTimeout(() => {
      this.ApplyFilter({
        exclCurr: true,
        dataType: this.dataType,
        saveOnly: true,
      });
    });
  }

  GetSelection(): Array<IFieldExpression> {
    const options = this.dataGridOptions;

    this.GetSelectionList();

    if (this.isDate) {
      return this.GetDateSelection();
    } else {
      // this.ApplyFilter(false, true, true);
      return this.GetCustomSelection();
    }
  }

  private _SelectionList: Array<any> = null;
  public get SelectionList(): Array<any> {
    if (this.isDate) {
      return this.dateHeirarchy;
    } else {
      return this._SelectionList ? this._SelectionList : [];
    }
  }

  GetSelectionList(): Array<string> {
    return [];
  }

  GetCustomSelection(): Array<IFieldExpression> {
    const list = this.SelectionList;
    if (!list) return [];
    if (list.length == 0) return [];

    let gc: DataGridColumn = this.dataColumn;
    if (!gc) return [];

    const lkpParams: ILookupParams = gc.lookupParams;
    const tgl = gc.lookupParams ? gc.lookupParams.toggleDisplay : null;

    let selArr: Array<IFieldExpression> = [];
    let indArr: Array<IFieldExpression> = [];

    const selItems = list.filter((i) => i.sel == -1);

    // check if all or none selected, return empty array
    if (selItems.length == 0 || selItems.length == list.length) return [];
    let items: Array<string> = [];
    let field: IFieldDefParam = { fieldName: gc.fieldName };

    // build raw filter expression
    selItems.forEach((item) => {
      let optVal: any = null;
      if (item.text != null) {
        optVal = item.text;

        // toggle lookup param is defined, look for the value
        // and collect if it exist
        if (tgl) {
          const tgi = tgl.find((tg) => tg.display == optVal);
          if (tgi) optVal = tgi.value;
        }
      }
      if (optVal == null) {
        indArr.push({
          fieldParam: field,
          operator: 'eq',
          value: null,
        });
      } else {
        items.push(optVal);
      }
    });

    /// build return array
    if (items.length > 1) {
      selArr.push({
        fieldParam: field,
        operator: 'in',
        values: items,
      });
    } else if (items.length == 1) {
      selArr.push({
        fieldParam: field,
        operator: 'eq',
        value: items[0],
      });
    }

    console.log('\nindArr:', indArr);

    if (indArr.length) {
      indArr.forEach((expr) => {
        if (selArr.length) selArr.push({ logicalOr: true });
        selArr.push(expr);
      });
    }

    console.log(
      '\nSelected Items:',
      selItems,
      ', items:',
      items,
      ', selArr:',
      selArr
    );

    return selArr;
  }

  GetDateSelection(): Array<IFieldExpression> {
    const selArr: Array<IFieldExpression> = [];
    const isAll = this.isYrSelStat(true, true) || this.isYrSelStat(false, true);
    if (isAll) return [];

    this.dateHeirarchy.forEach((yr) => {
      // is none of the dates under 'yr' is selected
      if (this.isMoSelStat(yr, true, true)) return;

      // if one or more or all dates selected
      if (this.isMoSelStat(yr, false, true)) {
        // if all dates in the year are selected, set filter to year
        // ; push year filter expression
        if (selArr.length) selArr.push({ logicalOr: true });
        selArr.push({
          fieldParam: {
            fieldName: this.dataColumn.fieldName,
            fieldFormat: 'YEAR',
            filterDataType: FilterDataType.DATE,
          },
          operator: 'eq',
          value: yr.name,
        });
      } else {
        // iterate through months
        yr.mos.forEach((mo) => {
          // is none of the dates under 'mo' is selected
          if (this.isDaySelStat(mo, true, true)) return;

          // if one or more or all dates selected
          if (this.isDaySelStat(mo, false, true)) {
            // if all dates in the month are selected, set filter to month
            // ; push month filter expression
            if (selArr.length) selArr.push({ logicalOr: true });
            selArr.push({
              fieldParam: {
                fieldName: this.dataColumn.fieldName,
                fieldFormat: 'MONTH',
                filterDataType: FilterDataType.DATE,
              },
              operator: 'eq',
              value: `${yr.name}-${mo.name}`,
            });
          } else {
            mo.days.forEach((day) => {
              // iterate through days
              if (day.sel == -1) {
                // ; day is selected, push day/date filter expression
                if (selArr.length) selArr.push({ logicalOr: true });
                selArr.push({
                  fieldParam: {
                    fieldName: this.dataColumn.fieldName,
                    fieldFormat: 'DATE',
                    filterDataType: FilterDataType.DATE,
                  },
                  operator: 'eq',
                  value: `${yr.name}-${mo.name}-${day.name}`,
                });
              }
            });
          }
        });
      }
    });

    return selArr;
  }

  private get dataGridOptions(): DataGridOption {
    if (!this.data) return null;
    if (!this.data.parent) return null;
    return this.data.parent.options;
  }

  RecordFilter(
    clear?: boolean,
    clearAllFilter?: boolean,
    clearSort?: boolean,
    clearAll?: boolean
  ) {
    if (!clear) clear = false;
    if (!clearAllFilter) clearAllFilter = false;
    if (!clearSort) clearSort = false;
    if (!clearAll) clearAll = false;

    if (clearAllFilter || clearAll)
      this.apiCommon.ClearAllFilter(this.dataGridOptions);
    if (clearSort || clearAll)
      this.apiCommon.ClearAllSort(this.dataGridOptions);

    if (clearAll || clearSort || clearAllFilter) return;

    let opt: DataGridOption = this.dataGridOptions;
    if (!opt) return;

    let gc: DataGridColumn = this.dataColumn;
    if (!gc) return;

    // set dataColumn sorting parameter
    gc.sortAsc = this.sortAscending;
    gc.sortDesc = this.sortDescending;

    // set filters to custom selection, if not custom selected, will be set to empty array
    gc.filters = this.GetSelection();

    const customFiltered = gc.filters.length != 0;

    if (customFiltered) {
      if (this.isDate) {
        gc.filterSelection = this.dateHeirarchy;
      } else;
    } else {
      gc.filterSelection = null;
    }

    // process filter(s)

    if (this.isMatrix && !customFiltered && !clear) {
      if (!gc.filterData) gc.filterData = this.EmptyForm;
      gc.filterData.patchValue(this.formData.value);

      const frmArray = gc.filterData.get('matrixValues') as FormArray;
      frmArray.clear();
      /**
       * FormArray.clear() - removes all elements in the array
       * FormArray.reset() - sets all element of the array to null
       * FormArray.push -  adds element to the array
       */

      // gc.filters.push({ logicalOrGroupStart: true });
      let isFirst: boolean = true;
      this.selectedValues.forEach((r) => {
        frmArray.push(
          new FormGroup({
            severity: new FormControl(r.severity),
            likelihood: new FormControl(r.likelihood),
          })
        );
        if (!isFirst) gc.filters.push({ logicalOr: true });
        else isFirst = false;
        gc.filters.push({ logicalAndGroupStart: true });
        gc.filters.push({
          fieldParam: { fieldName: this.matrix.severityField },
          operator: 'eq',
          value: r.severity,
        });

        gc.filters.push({
          fieldParam: { fieldName: this.matrix.likelihoodField },
          operator: 'eq',
          value: r.likelihood,
        });
        gc.filters.push({ logicalAndGroupEnd: true });
      });

      // gc.filters.push({ logicalOrGroupEnd: true });

      return;
    }

    if (!clear && !customFiltered) {
      const isRange = this.isRange;
      let v1: any = null;
      let v2: any = null;
      if (isRange) {
        v1 = this.GetSearchValue(
          this.isDate ? this.searchDateStart : this.searchValue1
        );
        v2 = this.GetSearchValue(
          this.isDate ? this.searchDateEnd : this.searchValue2
        );
      } else {
        v1 = this.GetSearchValue(
          this.isDate ? this.searchDateValue : this.searchValue1
        );
      }

      if (v1 != null && String(v1) != '') {
        if (this.isDate) {
          // format values to yyyy-mm-dd
          v1 = this.dateToString(v1).substr(0, 10);
          if (v2) v2 = this.dateToString(v2).substr(0, 10);
        }

        gc.filters.push({
          fieldParam: {
            fieldName: this.dataColumn.fieldName,
            filterDataType: this.dataType,
          },
          operator: this.operatorValue,
          value: v1,
          value1: v1,
          value2: v2,
        });
      }

      // set search box value to empty before saving to dataColumn's filterData form
      this.formData.get('search').setValue('');
      if (!gc.filterData) gc.filterData = this.EmptyForm;

      gc.filterData.patchValue(this.formData.value);
    } else if (clear) {
      this.apiCommon.ClearColumnFilter(gc);
    }

    console.log('Data COLUMN:', gc);
  }

  private get EmptyForm(): FormGroup {
    return this.apiCommon.EmptyFilterForm;
  }

  padNum(num: number, length?: number): string {
    if (!length) length = 2;
    const ret = '0'.repeat(length) + num.toString();
    return ret.substr(ret.length - length, length);
  }

  dateToString(dt: Date): string {
    return `${dt.getFullYear()}-${this.padNum(dt.getMonth() + 1)}-${this.padNum(
      dt.getDate()
    )}T${this.padNum(dt.getHours())}:${this.padNum(
      dt.getMinutes()
    )}:${this.padNum(dt.getSeconds())}`;
  }
}
