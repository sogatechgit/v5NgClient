import {
  DataOption,
  IProcessRequestData,
  IUserInfo,
  ITreeTableConfig,
  IAnomalyTableConfig,
  IClientServerInfo,
} from './../mod/app-common.classes';
import { RequestParams } from './../mod/app-params.model';
import { AppReturn } from './../mod/app-return.model';
import { Subscription, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ColumnInfo } from '../mod/app-column.model';
import { AppCommonMethods } from './app-common.methods';
import { AppCommonMethodsService } from './app-common-methods.service';
import { rawListeners } from 'node:process';

export class DatasetBase extends AppCommonMethods {
  constructor(
    public http: HttpClient,
    public apiCommon: AppCommonMethodsService,
    public dialog: any,
    public data?: any
  ) {
    super();
  }

  public tables: any = {};

  public sqlBuilder: DataOption = new DataOption([]);

  public AddTable(dataTable: any) {
    this.tables[dataTable.tableCode] = dataTable;
    return dataTable;
  }

  public clu(msg: any, userId?: string, newLinePerPair?: boolean): void {
    this.cl(msg, newLinePerPair, userId);
  }
  public cl(msg: any, newLinePerPair?: boolean, userId?: string): void {
    if (!userId) userId = 'alv';
    if (msg == null || msg == undefined || this.userInfo.id != userId) return;

    if (newLinePerPair == undefined) newLinePerPair = true;

    const type: string = typeof msg;

    // console.log('\nType of msg: ', type, ', length:', !msg ? -1 : msg.length);

    if (type == 'object') {
      if (msg.length == undefined) {
        // object
        console.log(msg);
      } else {
        // array type
        if (newLinePerPair) {
          for (let ctr: number = 0; ctr < msg.length; ctr += 2) {
            console.log(msg[ctr] + ': ', msg[ctr + 1]);
          }
        } else {
          console.log(msg);
        }
      }
    } else {
      console.log(msg);
    }
    //
  }

  // declaration of property is necessary to gain access to it
  // locally during design time, and when the value is overwritten
  // in the derived class, the new value will take effect even
  // even when used locally in the parent class....
  public get userInfo(): IUserInfo {
    return this.apiCommon.userInfo;
  }

  private _csInfo: IClientServerInfo;
  public get csInfo(): IClientServerInfo {
    this.SetCurrentServerTime();
    return this._csInfo;
  }

  SetCurrentServerTime() {
    const csi = this._csInfo;
    if (csi) {
      if (!csi.serverCurrentStamp) csi.serverCurrentStamp = csi.serverStamp;
      if (csi.serverStamp && csi.serverStamp) {
        const dtc = new Date();
        const ctm = dtc.getTime();
        const otm = csi.clientStamp.getTime();
        const ssc = csi.serverStamp.getTime() + (ctm - otm);

        csi.serverCurrentStamp = new Date(ssc);
      }
    }
  }

  private oldServerTime: Date = null;
  private oldServerTimeFmt: string = null;
  private oldServerDateTimeFmt: string = null;
  public get serverTime(): string {
    const csi = this.csInfo;
    if (!csi) return null;
    const tm = csi.serverCurrentStamp;
    const p = this.apiCommon.p0;

    if (this.oldServerTime != csi.serverCurrentStamp) {
      // set format ....
      const gmt = 0 - tm.getTimezoneOffset() / 60;
      this.oldServerTime = csi.serverCurrentStamp;
      this.oldServerTimeFmt = `${p(tm.getHours())}:${p(tm.getMinutes())}:${p(tm.getSeconds())} GMT${gmt < 0 ? gmt : ('+' + gmt)
        }`;
    }

    return this.oldServerTimeFmt;
  }

  public get serverDateTime(): string {
    const csi = this.csInfo;
    if (!csi) return null;
    const tm = csi.serverCurrentStamp;
    const p = this.apiCommon.p0;

    if (this.oldServerTime != csi.serverCurrentStamp) {
      // set format ....
      const gmt = 0 - tm.getTimezoneOffset() / 60;
      this.oldServerTime == csi.serverCurrentStamp;
      this.oldServerDateTimeFmt = `${p(tm.getDate())} ${this.apiCommon.MonthStr(
        tm.getMonth()
      )} ${tm.getFullYear()} ${p(tm.getHours())}:${p(tm.getMinutes())}:${p(tm.getSeconds())} GMT${gmt < 0 ? gmt : ('+' + gmt)
        }`;
    }

    return this.oldServerDateTimeFmt;
  }


  private _apiUrl: string;

  public get apiUrl(): string {
    return this._apiUrl;
  }
  public set apiUrl(value: string) {
    this._apiUrl = value;
  }

  public get referenceRoot(): string {
    return this.data.referenceRoot;
  }

  public get urlBase(): string {
    return this.apiUrl.substr(0, this.apiUrl.indexOf('/api') + 4);
  }

  KeepAlive(onSuccess?: Function, runOnce?: boolean) {
    // console.log("KeepAlive: ",new Date())
    this.Get(
      [
        {
          code: 'chgTrack',
          key: '0',
          keyField: 'TRK_ID',
          forceRequest: true,
        },
      ],
      {
        onSuccess: (data) => {
          //console.log('\nSuccess on keeping alive! ', this.ds.csInfo, data);
          if (onSuccess) onSuccess(data);
        },
        onError: (err) => {
          console.log(
            '\nError on keeping alive! ' + this.dateStampString,
            err
          );
        },
      }
    );

    // set interval of 10 mins to keep api component running
    if (!runOnce) {
      const minSecs = 60 * 1000;
      const mins = 5;
      setTimeout(() => {
        this.KeepAlive();
      }, mins * minSecs);
    }
  }

  SecondsUpdate() {
    setTimeout(() => {
      this.SetCurrentServerTime();
      this.SecondsUpdate();
    }, 1000);
  }

  public toPostData(table: any): any {
    let ret: Array<any> = [];

    let toPost: Array<any> = table.__dirtyRows();
    let link: Array<string> = table.TableLinks();
    let tableCode: string = null;
    let dirtyChildren: any = null;

    if (link != null) {
      // collect all dirty rows from all linked tables
      dirtyChildren = {};
      link.forEach((L) => {
        let linkArr: Array<string> = L.split('|');
        let tableCode: string = linkArr[0];
        let childTable = this.tables[tableCode];
        dirtyChildren[tableCode] = childTable.__dirtyRows();
      });
    }

    toPost.forEach((e) => {
      let dirtyData: any = this.CloneData(e.toPostData);
      ret.push(dirtyData);
      if (link != null) {
        let keyCol: ColumnInfo = table.keyFields[0];
        let key: number = e[keyCol.name];

        link.forEach((L) => {
          let linkArr: Array<string> = L.split('|');
          tableCode = linkArr[0];
          let childTable: any = this.tables[tableCode];
          let childDirtyRows: Array<any> = childTable.__dirtyRows(key);

          if (childDirtyRows.length != 0) {
            dirtyData[tableCode] = [];
            childDirtyRows.forEach((cr) => {
              dirtyData[tableCode].push(this.CloneData(cr.toPostData));
            });
          } else {
          }
        });
      }
    });
    return ret; // tableCode ? ret[tableCode] : ret;
  }

  get PostHeaderInfo(): any {
    return {
      _req_stamp_: new Date(),
      __uid__: this.userInfo.id,
      __uname__: this.userInfo.name,
      __rights__: this.userInfo.rights,
      __action__: 'SaveData',
    };
  }

  private _SpecialTables: any = {};
  get NodesTable(): any {
    return this.GetSpecialTable('nodes');
  }

  get TreeTable(): any {
    return this.GetSpecialTable('tree');
  }

  get TreeTableConfig(): ITreeTableConfig {
    let ret: ITreeTableConfig = {};
    const tbl = this.TreeTable;
    if (tbl) {
      const cfg = tbl.clientConfig;
      ret.TreeTable = tbl;
      ret.parentKeyField = cfg.parentKeyField;
      ret.locationField = cfg.locationField;
      ret.orderField = cfg.orderField;
      ret.groupField = cfg.groupField;
      ret.dataField = cfg.dataField;
    }
    return ret;
  }

  get CommonLookupTable(): any {
    return this.GetSpecialTable('commonlookup');
  }

  GetSpecialTable(tableRole: string) {
    if (this._SpecialTables[tableRole] == undefined) {
      this._SpecialTables[tableRole] = null;

      for (let tableCode in this.tables) {
        const tbl = this.tables[tableCode];
        if (tbl.roles.indexOf(tableRole) != -1)
          this._SpecialTables[tableRole] = tbl;
      }
    }
    return this._SpecialTables[tableRole];
  }

  extractFirstText(str): string {
    const matches = str.match(/"(.*?)"/);
    return matches
      ? matches[1]
      : str;
  }


  get PostHeaderInfo64(): string {
    return btoa(JSON.stringify(this.PostHeaderInfo));
  }

  PostX(temp?: any): Observable<any> {
    const url: string = this.apiUrl;
    const body = {};
    const headers = new HttpHeaders();

    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Type', 'application/json');

    return this.http.post(url, body, { headers: headers });
  }

  Post(
    formData: any,
    args?: { onSuccess?: Function; onError?: Function }
  ): Observable<any> {
    const headers = new HttpHeaders();

    // hdrs.set('Content-Type', 'application/json; charset=utf-8');
    headers.set('Content-Type', 'multipart/form-data');
    // headers.set('Accept', 'application/json');

    // headers.set('Access-Control-Allow-Origin', '*');
    // headers.set('Content-Type', 'application/json');
    // headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");

    // headers.append(
    //   'Access-Control-Allow-Origin',
    //   'Origin, X-Requested-With, Content-Type, Accept'
    // );

    let url: string = this.apiUrl;
    let body: any = { __header__: this.PostHeaderInfo64 };

    // append formData properties to body object
    for (const key in formData) {
      // key represents table codes where formData[key] contains the rows to process
      body[key] = formData[key];

      // key == '__config__', server side routine will get processing instructions from
    }

    //let options = new RequestO({ headers: headers });
    return this.http.post(url, body, { headers: headers });
  }

  Get(
    reqParams: Array<RequestParams>,
    args?: { onSuccess?: Function; onError?: Function; usePOST?: boolean; configData?: any }
  ): Subscription {
    // get table data based on base64 encoded json parameters

    // initialize parameter array
    const jsonParams: Array<any> = [];
    const jsonParamsStr: Array<string> = [];
    const clearTableCodes: Array<string> = [];

    if (args == undefined) args = {};
    let { onSuccess, onError, usePOST } = args;

    // usePOST switch will be used to test if .post or .get method will be requested
    // as of 2020-11-05, this is not yet imlpemented
    if (usePOST == undefined) usePOST = true;

    let reqConfig: RequestParams = null;

    reqParams.forEach((p) => {
      // create string JSON to log to history.
      // historical request checking is very IMPORTANT !!!
      // in order to prevent same requests to be processed
      // multiple times ...
      const jStr: string = JSON.stringify(p);

      // clear history if datatable will have different set of rows
      // each time request to the server is made
      let clearExisting =
        p.clearExisting == undefined ? false : p.clearExisting;
      let forceRequet = p.forceRequest == undefined ? false : p.forceRequest;
      const snapshot = !p.snapshot ? false : p.snapshot;

      // remove request history to force request to server...
      if (clearExisting || forceRequet || snapshot)
        this.apiCommon.ClearHistoryLog(jStr);

      // add table code to collection to flag requirement for clearing rows collection
      // push only the main table code and ignore join parameters
      // from the pipe separator
      if (clearExisting) clearTableCodes.push(p.code.split('|')[0]);

      if (
        !this.apiCommon.IsWithHistory(jStr) &&
        !this.apiCommon.IsWithPending(jStr)
      ) {
        //
        const paramCodeArr = p.code.split('|'); // get main table and join expression elements
        const paramCode = paramCodeArr[0] + '';

        // get table object
        if (paramCode) {
          if (paramCode == '@config') {
            // set subsciption
            reqConfig = p;
          } else {
            const tbl: any = this.tables[paramCode];

            if (tbl != null) {
              // set pendingRequest flag on each table
              tbl.pendingRequest = true;

              // set request flag
              this.apiCommon.AddRequestFlag(jStr);
              jsonParamsStr.push(jStr);
            } else {
              console.log('Null Table for ' + paramCode);
            }
          }

          // append RequestParameter
          jsonParams.push(p);
        } // if paramCode is not empty (END)
      } else {
        if (this.apiCommon.IsWithHistory(jStr))
          console.log('REQUEST ALREADY MADE!!!');
      }
    });

    // if all set of parameters are already in the history
    if (jsonParams.length == 0) {
      return;
    } else {
    }

    // create request internally in the Get method
    if (reqConfig == null) reqConfig = new RequestParams();

    if (reqConfig.subsKey == undefined)
      reqConfig.subsKey = this.apiCommon.newSubsKey;
    if (reqConfig.code == undefined) reqConfig.code = '@config';

    jsonParams.push(reqConfig);

    // form url here with encoded parameters
    const jString = JSON.stringify(jsonParams);
    // console.log('\nJSTRING:', jString);
    // let url: string = this.apiUrl + '?_p=' + btoa(jString);
    let url: string = this.apiUrl; // + '?_p=' + btoa(jString);
    let body: any = { _p: btoa(jString) };

    //let tableRows: Array<Array<any>> = [];
    let procData: IProcessRequestData = null;
    let tableRows: Array<Array<any>> = [];

    const startStamp = new Date();

    const hdrs = new HttpHeaders();

    hdrs.append('Content-Type', 'application/json; charset=utf-8');
    hdrs.append('Access-Control-Allow-Origin', '*');
    // hdrs.set(
    //   'Access-Control-Allow-Origin',
    //   'Origin, X-Requested-With, Content-Type, Accept'
    // );
    // this.cl(['GET Body ', body]);
    let ret: Subscription = this.http
      //body
      // .get<Array<AppReturn>>(url, { headers: hdrs })
      .post<Array<AppReturn>>(url, body, { headers: hdrs })
      .subscribe(
        (data: any) => {
          // process data including setting pendingRequest flag
          // for each table.

          // !!! AT THIS POINT, DATA VALIDATION MUST BE IN PLACE IN ORDER TO
          // IDENTIFY IF THE RESPONSE FROM THE SERVER IS OF EXPECTED FORMAT !!!!

          procData = this.apiCommon.ProcessRequestData(
            data,
            this.tables,
            url,
            startStamp,
            undefined,
            clearTableCodes
          );

          //tableRows = procData.data;

          // add request to history log. this log will be checked for subsequent requests
          // where calls for existing entries will be bypassed to improve performance efficiency
          jsonParamsStr.forEach((key) => this.apiCommon.AddHistoryLog(key));

          // this removes entry to collection if URL that is used to prevent same-request concurrency issues
          // request concurrency check is necessary to prevent duplicate records post-processing
          // action when similar multiple requests return back to the client.
          jsonParamsStr.forEach((key) => this.apiCommon.ClearRequestFlag(key));

          // call onSuccess parameter function if defined
          let config: any = null;
          if (args)
            if (onSuccess != undefined) {
              config = data.find((r) => r.returnType == 'config');
              if (config) {
                // remove config element from the raw data
                data.shift();
                // transfer subscription key to the new first element of the
                /// raw data array.
                if (data.length) data[0].subsKey = config.subsKey;
              }

              config.clientStamp = new Date();
              config.configData = args.configData ? args.configData : {};

              if ((data ? data.length : false) && config) {
                const retParams = data[0].returnDataParams;


                config.serverStamp = new Date(retParams.serverStamp);

                // If  set initial server and client dates
                if (!this._csInfo) {

                  this._csInfo = {
                    clientStamp: config.clientStamp,
                    serverStamp: config.serverStamp,
                  };
                }
              }

              const dataObj = {
                raw: data,
                processed: procData,
                config: config,
              };

              // console.log(
              //   'STAMPS: ',
              //   config.clientStamp.getMilliseconds(),
              //   config.serverStamp.getMilliseconds()
              // );

              onSuccess(dataObj);
            }

          // unsubscrbe! to prevent memory leak
          this.apiCommon.UnSubscribe(data);
        }, // end of success

        (error: any) => {
          // call onError parameter function if defined
          if (onError != undefined) onError(error);

          // clear flags for each table/request params
          jsonParams.forEach((p) => {
            const tbl: any = this.tables[p.code];
            if (tbl) tbl.pendingRequest = false;
          });
          jsonParamsStr.forEach((key) => this.apiCommon.ClearRequestFlag(key));
        }
      );

    // log subscription to the subscription collection in apiCommon

    if (reqConfig.subsKey != undefined && reqConfig.subsKey != null) {
      this.apiCommon.TblSubs[reqConfig.subsKey] = { subs: ret, when: Date.now };
    }

    return ret;
  }

  CloneData(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  //public XL(text:string):string{
  // returns translation of english 'text' from the selected language if one is available
  //    return text;
  // }

  private GenTextKey(text: string) {
    return text.toLowerCase().replace(/ /gi, '_');
  }

  public StrKey(str: string): string {
    let ret: string = '';
    let strNorm: string = str.toLowerCase().replace(/  /gi, ' ');
    while (strNorm.indexOf('  ') != -1) {
      strNorm = strNorm.replace(/  /gi, ' ');
    }

    let wordArr: Array<string> = strNorm.split(' ');
    let word: string;
    let i: number;
    let j: number;

    for (i = 0; i < wordArr.length; i++) {
      let wordASC: number = 255;
      word = wordArr[i];

      for (j = 1; j <= word.length; j++) {
        wordASC = wordASC ^ (i + j + word.substr(j - 1, 1).charCodeAt(0));
      }
      ret += wordASC.toString(16);
    }

    return 'S' + ret.toUpperCase();
  }

  private _translations: any = {
    SEE91: 'Ilagay ang Text',
    S8D: 'Paglalarawam',
    SE4EB: 'Uri ng dokumento',
    SE2F6: 'Katangian ng Gumagamit',
  };

  public XL(text: string, args?: any) {
    // translate methos
    let key: string = this.StrKey(text);
    let ret: any = this._translations[key];
    if (ret) {
      return ret;
    } else {
      return text;
    }
  }

  // OpenDetails(mode: string): Observable<any> {
  //   if (this.moduleExchangeInfo) {
  //     const detailsObject = this.moduleExchangeInfo.detailsObject;
  //     if (detailsObject) {
  //       const detailsComponent: Type<any> = detailsObject.constructor;
  //       const isEdit = mode == 'edit';

  //       const args = {
  //         detailsItem: {
  //           // params of popup component
  //           component: detailsComponent,
  //           data: {
  //             hostObject: this,
  //             DetailsForm: detailsObject.form, // ! do not remove, this will be used when poppping up details
  //             AccessMode: mode,
  //             title: isEdit ? detailsObject.titleEdit : detailsObject.titleNew,
  //             moduleExchangeInfo: this.moduleExchangeInfo,
  //           },
  //         },

  //         // params of DetailsPopup
  //         width: detailsObject.popWidth,
  //         height: detailsObject.popHeight,

  //         icon: isEdit ? detailsObject.iconEdit : detailsObject.iconNew,
  //         title: isEdit ? detailsObject.titleEdit : detailsObject.titleNew,
  //         buttons: detailsObject.popButtons,
  //       };

  //       const { width, height, detailsItem, icon, title, buttons } = args;

  //       const ref = this.dialog.open(DetailsPopup, {
  //         minWidth: `${width}px`,
  //         minHeight: `${height}px`,
  //         disableClose: false,
  //         data: {
  //           // data belonging to popup
  //           component: detailsItem,
  //           title: title,
  //           buttons: buttons,
  //           icon: icon,
  //           buttonClick: this.DetailsButtonClick,
  //         },
  //       });

  //       return ref.afterClosed();
  //     }
  //   } else {
  //     return null;
  //   }
  // }
}

enum LookupGroupKeys {
  ReferenceLibraryType = 139,
  CENTER = 'center',
  RIGHT = 'right',
}
