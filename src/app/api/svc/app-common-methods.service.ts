import { IPopupButton, IPopupPrompts } from './../cmp/details.popup';
import { Observable } from 'rxjs';
import { DataGridOption } from './../cmp/data-grid/data-grid.component';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { IProcessRequestData, IUserInfo } from './../mod/app-common.classes';
import { AppCommonMethods } from './app-common.methods';
import { Injectable } from '@angular/core';
import { getLocaleDateTimeFormat } from '@angular/common';
import { DataGridColumn } from '../cmp/data-grid/data-grid.component';
import { ColumnInfo } from '../mod/app-column.model';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppCommonMethodsService extends AppCommonMethods {
  constructor(public http: HttpClient) {
    super();
  }

  Init() {
    return new Promise<void>((resolve, reject) => {
      ////do your initialisation stuff here
      const path = './assets/config/devsetup.json';
      const subs = this.http.get(path).subscribe(
        (result: any) => {
          // console.log('\nSUCCESS RESULT', result);

          this.userInfo = {
            key: result.dev_key,
            id: result.dev_id,
            name: result.dev_name,
            email: '',
            phone: '',
            rights: {
              canAdd: true,
              canEdit: true,
              canDelete: true,
            },
          };

          resolve();
          subs.unsubscribe();
        },
        (error) => {
          console.log('\nERROR RESULT', error);
          this.userInfo = {
            key: 1,
            id: 'admin',
            name: 'Administrator!',
            email: '',
            phone: '',
            rights: {
              canAdd: true,
              canEdit: true,
              canDelete: true,
            },
          };
          subs.unsubscribe();
          reject(error);
        }
      );
    }).catch((err) => {
      console.log('\nERROR RESULT err', err);
    });
  }

  /*******************************************************************
   * Declaration of public properties
   *******************************************************************/
  public PARAMS_DELIM_CHAR = '';
  public PARAMS_VAL_DELIM_CHAR = '';
  public FIELD_PARENT_LINK_ALIAS = '';
  public FIELD_CHILD_FIRST_ALIAS = '';
  public FIELD_CHILD_COUNT_ALIAS = '';

  public userInfo: IUserInfo = null;

  //public http: HttpClient;

  public APP_CONFIG = {
    appTitleMain: 'Main Application',
    appTitleSub: 'Sub Title',
    appModules: [{}],
  };

  public isLeapYear(year?: number): boolean {
    if (!year) year = new Date().getFullYear();
    return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
  }

  public MONTHS(year?: number): Array<any> {
    //const date = year ? new Date(`${year}-01-01`) : new Date();
    return [
      { name: 'January', end: 31 },
      {
        name: 'Febuary',
        end: this.isLeapYear(year ? year : new Date().getFullYear()) ? 29 : 28,
      },
      { name: 'March', end: 31 },
      { name: 'April', end: 30 },
      { name: 'May', end: 31 },
      { name: 'June', end: 30 },
      { name: 'July', end: 31 },
      { name: 'August', end: 31 },
      { name: 'September', end: 30 },
      { name: 'October', end: 31 },
      { name: 'November', end: 30 },
      { name: 'December', end: 31 },
    ];
  }



  MonthStr(moNum:number):string{
    return this.MONTHS()[moNum].name;
  }


  ClearAllFilter(options: DataGridOption) {
    options.columns.forEach((col) => {
      if (!col.filters) return;
      if (!col.filters.length) return;
      this.ClearColumnFilter(col);
    });
  }

  ClearAllSort(options: DataGridOption) {
    options.columns.forEach((col) => {
      if (col.sortAsc) {
        col.sortAsc = false;
        if (col.filterData) col.filterData.get('sortAscending').setValue(false);
      }
      if (col.sortDesc) {
        col.sortDesc = false;
        if (col.filterData)
          col.filterData.get('sortDescending').setValue(false);
      }
    });
  }

  ClearColumnFilter(column: DataGridColumn) {
    // clear form data
    let form: FormGroup = this.EmptyFilterForm;

    column.filters = [];
    column.filterSelection = null;

    if (column.sortAsc || column.sortDesc) {
      form.get('sortAscending').setValue(column.sortAsc);
      form.get('sortDescending').setValue(column.sortDesc);

      column.filterData = form;
    } else {
      column.filterData = null;
    }
  }

  public get EmptyFilterForm(): FormGroup {
    let newForm: FormGroup = new FormGroup({
      searchValues: new FormArray([
        new FormControl(''),
        new FormControl(''),
        new FormControl(''),
      ]),
      matrixValues: new FormArray([]),
    });

    newForm.addControl('operatorValue', new FormControl('eq'));
    newForm.addControl('operatorPrompt', new FormControl('Equal To'));
    newForm.addControl('sortAscending', new FormControl(false));
    newForm.addControl('sortDescending', new FormControl(false));
    newForm.addControl('searchValue1', new FormControl(null));
    newForm.addControl('searchValue2', new FormControl(null));
    newForm.addControl('dateDisplay', new FormControl(null));
    newForm.addControl('dateValue', new FormControl(null));
    newForm.addControl('dateStart', new FormControl(null));
    newForm.addControl('dateEnd', new FormControl(null));
    newForm.addControl('search', new FormControl(null));

    return newForm;
  }

  private _TestProp: number = 0;
  public get TestProp(): number {
    return this._TestProp;
  }
  public set TestProp(value: number) {
    this._TestProp = value;
  }

  /*******************************************************************
   * Manage hitorical requests and current request
   *******************************************************************/

  private _pendingRequests: Array<string> = [];
  private _historicalRequests: Array<string> = [];

  public get History(): Array<string> {
    return this._historicalRequests;
  }
  public get Pending(): Array<string> {
    return this._pendingRequests;
  }

  IsWithHistory(url: string): boolean {
    let idx: number = this._historicalRequests.indexOf(url);
    return idx != -1;
  }

  AddHistoryLog(key: string) {
    let idx: number = this._historicalRequests.indexOf(key);
    if (idx == -1) this._historicalRequests.push(key);
  }

  ClearHistoryLog(key: string) {
    let idx: number = this._historicalRequests.indexOf(key);
    if (idx != -1) this._historicalRequests.splice(idx, 1);
  }

  IsWithPending(url: string): boolean {
    let idx: number = this._pendingRequests.indexOf(url);
    return idx != -1;
  }

  ClearRequestFlag(reqKey: string) {
    let idx: number = this._pendingRequests.indexOf(reqKey);
    if (idx != -1) this._pendingRequests.splice(idx, 1);
  }

  AddRequestFlag(reqKey: string) {
    let idx: number = this._pendingRequests.indexOf(reqKey);
    if (idx == -1) this._pendingRequests.push(reqKey);
  }

  ProcessRequestData(
    data: Array<any>,
    tables?: any,
    url?: string,
    startStamp?: Date,
    reqTableCodes?: Array<string>,
    clearTableCodes?: Array<string>,
    snapshot?: boolean
  ): IProcessRequestData {
    if (!data || !tables) return;
    if (reqTableCodes == undefined) reqTableCodes = [];
    if (clearTableCodes == undefined) clearTableCodes = [];
    if (snapshot == undefined) snapshot = false;

    let tableRows: Array<Array<any>> = [];
    let tableLookups: Array<any> = [];

    // find config object
    //config
    const reqConfig: Array<any> = data.find((o) => o.returnType == 'config');

    // filter only objects with returnType = 'table'
    let retTables: Array<any> = data.filter((o) => o.returnType == 'table');

    // loop through objects and call the local ProcessRequestedRecords method

    retTables.forEach((t) => {
      // get table object where key is the table code (t.returnCode)
      let tbl: any = tables[t.returnCode];

      if (clearTableCodes.indexOf(t.returnCode) != -1) {
        // if table code is listed in clearTableCodes variable, purge all records from the
        // target table object
        // Remove all rows inside the table
        tbl.PurgeAll();
      }

      // set pendingRequest flag for each table
      tbl.pendingRequest = false;

      // Calculate time elapsed in milliseconds from the start of request to
      // the server response time
      if (startStamp) {
        const timeElapsed = this.getDateMilliseconds(startStamp, new Date());
        t.roundTripDuration = timeElapsed;
      }

      // populate/update record(s) in the table object
      if (tbl) {
        tableRows.push(tbl.ProcessRequestedRecords(t));
        // iterate with inlineLookups
        if (t.returnDataParams.inlineLookups) {
          let lkpObj = {};
          t.returnDataParams.inlineLookups.forEach((lkp: any) => {
            // assign raw? lookup object to displayField property

            lkpObj[lkp.displayField] = lkp.lookup;
            if (lkp.displayFieldSub) {
              // convert lookup values into array of strings
              for (let key in lkpObj[lkp.displayField])
                lkpObj[lkp.displayField][key] = lkpObj[lkp.displayField][
                  key
                ].split('|');
            }
          });
          tableLookups.push(lkpObj);
        } else {
          tableLookups.push(null);
        }
      } else console.log("Table object '" + t.returnCode + "' not found!");
    });

    return { data: tableRows, lookups: tableLookups };
  }
  // *******************************************************************
  // **********************  Subscription Management ****************************
  private _UnSubscribeCounter: number = 0;

  private _subsCounter: number = 0;
  public get newSubsKey(): string {
    this._subsCounter++;
    return 'sKey_' + this._subsCounter;
  }

  private _TblSubs: any = {};
  public get TblSubs(): any {
    return this._TblSubs;
  }

  UnSubscribe(e: any, abandoned?: boolean) {
    if (abandoned == undefined) abandoned = false;
    if (abandoned) {
      // clean all abandoned subscriptions which did not return to the client
      // after a duration set in seconds(e.g. dur=60*5 - i,e, 5mins);
      this._UnSubscribeCounter++;

      for (var key in this._TblSubs) {
        let subs: any = this._TblSubs[key];
        this._cl(
          'Unsubscribe abandoned!',
          abandoned,
          Date.now(),
          this._UnSubscribeCounter
        );
        if (subs) {
          // if subscription is not null
          let when: number = subs.when;
          if (this.MSSince(when) >= 5 * 60 * 1000) {
            // unsubscribe substriptions without response for at least 5 mins
            subs.subs.unsubscribe();
            delete this._TblSubs[key];
          }
        }
      }
      setTimeout(() => {
        this.UnSubscribe(null, true);
      }, 60 * 1000);
      return;
    }

    // get Subscription key. If e is an array, get the first element then
    // get the subsKey property, else, get the subKey of the JSON object

    let retSubsKey: string = '';
    if (e.raw) {
      retSubsKey = e.raw.subsKey;
    } else {
      // get subscription key from row 0
      retSubsKey =
        typeof e.length != undefined ? (e[0] ? e[0].subsKey : '') : e.subsKey;
    }

    let subs: any = retSubsKey ? this._TblSubs[retSubsKey] : null;

    if (subs) {
      let currSubs: number = this.SubsCounter();
      subs.subs.unsubscribe();
      this._TblSubs[retSubsKey] = null;
      delete this._TblSubs[retSubsKey];
    }
  }

  SubsCounter(): number {
    let ret: number = 0;
    for (var key in this._TblSubs) {
      ret++;
    }
    return ret;
  }

  MaxElement(arrObject: Array<any>, prop: string): any {
    const max = arrObject.reduce(function (prev, current) {
      return prev[prop] > current[prop] ? prev : current;
    }); //returns object
    return max;
  }

  p0(num:number, count?:number, str?:string):string{
    if(!count) count = 2;
    if(!str)str = '0';
    const numStr = String(num);
    if(count < numStr.length)count = numStr.length
    const ret = (str.repeat(count) + numStr);
    return ret.substr(ret.length - count);
  }

  // ************************* prompts and buttons **************************************
  get popButtons(): Array<IPopupButton> {
    return [
      {
        label: 'Cancel',
        style: 'btn bg-secondary text-white',
        value: 'cancel',
        icon: 'fa fa-times-circle text-light',
        // icon: 'fa fa-sign-out-alt text-light',
      },
      {
        label: 'Restore',
        style: 'btn bg-secondary text-white',
        value: 'restore',
        icon: 'fa fa-undo text-light',
      },
      {
        label: 'Save',
        style: 'btn bg-warning text-dark',
        value: 'save',
        icon: 'far fa-save text-secondary',
      },
    ];
  }

  get btnConfirm(): Array<IPopupButton> {
    return [
      {
        label: 'Yes',
        value: 'yes',
        style: 'btn btn-warning',
        icon: 'far fa-thumbs-up text-secondary',
      },
      {
        label: 'No',
        value: 'no',
        style: 'btn btn-secondary',
        icon: 'far fa-thumbs-down text-light',
      },
    ];
  }

  get btnInfo(): Array<IPopupButton> {
    return [
      {
        label: 'Ok',
        value: 'ok',
        style: 'btn btn-secondary text-light',
        icon: 'far fa-thumbs-up',
      },
    ];
  }
  get popPrompts(): IPopupPrompts {
    return {
      cancelNoChange: {
        title: 'Information',
        message: 'No changes made to cancel',
        icon: 'fa fa-info-circle',
        icon_color: '#28a745',
        buttons: this.btnInfo,
      },
      cancelWithChange: {
        title: 'Cancel warning',
        message: 'Unsaved changes will be lost.<br/>Do you want to continue?',
        icon: 'far fa-question-circle',
        icon_color: '#ffc107',
        buttons: this.btnConfirm,
      },
      resetNoChange: {
        title: 'Information',
        message: 'No changes made. Current record is up to date',
        icon: 'fa fa-info-circle',
        icon_color: '#28a745',
        buttons: this.btnInfo,
      },
      resetWithChange: {
        title: 'Reset warning',
        message: 'Changes made will be discarded. Do you want to continue?',
        icon: 'far fa-question-circle',
        icon_color: '#ffc107',
        buttons: this.btnConfirm,
      },
      saveNoChange: {
        title: 'Information',
        message: 'Record is up to date. No nothing to save.',
        icon: 'fa fa-info-circle',
        icon_color: '#28a745',
        buttons: this.btnInfo,
      },
      saveWithChange: {
        title: 'Confirm save',
        message:
          'You are about to save changes made.<br/>Do you want to continue?',
        icon: 'far fa-question-circle',
        icon_color: '#ffc107',
        buttons: this.btnConfirm,
      },
      linkNoSelected: {
        title: 'Information',
        message: 'No additional nor removed items.<br/>Nothing to save.',
        icon: 'fa fa-info-circle',
        icon_color: '#28a745',
        buttons: this.btnInfo,
      },
      linkWithSelected: {
        title: 'Confirm link item(s)',
        message:
          'You are about to save changes made.<br/>Do you want to continue?',
        icon: 'far fa-question-circle',
        icon_color: '#ffc107',
        buttons: this.btnConfirm,
      },
      deleteNoRecord: {
        title: 'No record selected',
        message: 'Please select record to delete?',
        icon: 'fa fa-info-circle',
        icon_color: '#28a745',
        buttons: this.btnInfo,
      },
      deleteWithRecord: {
        title: 'Confirm delete',
        message:
          'You are about to delete the current record.<br/>Do you want to continue?',
        icon: 'far fa-trash-alt',
        icon_color: '#dc3545',
        buttons: this.btnConfirm,
      },
    };
  }
}
