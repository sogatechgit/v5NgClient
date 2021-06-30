import { FileUploaderComponent } from './../api/cmp/file-uploader/file-uploader.component';
import { AppMainServiceService } from './app-main-service.service';
import { AppFormAComponent } from './../api/cmp/app-form-a/app-form-a.component';
import { DataTabsOption } from './../api/cmp/data-tabs/data-tabs.component';
import { DataGridOption } from './../api/cmp/data-grid/data-grid.component';
import { CellTextAlign } from 'src/app/api/cmp/data-grid/data-grid.component';
import {
  ILookupItem,
  ILookupMapInfo,
  IUserInfo,
} from './../api/mod/app-common.classes';
import { FormGroup } from '@angular/forms';
import { IAppVersion, RequestParams } from './../api/mod/app-params.model';
import {
  TreeViewNode,
  TreeViewComponent,
} from './../api/cmp/tree-view/tree-view.component';
import { Relation } from './../api/svc/app-common.datatable';
import { AppCommonMethodsService } from '../api/svc/app-common-methods.service';
import { DatasetBase } from '../api/svc/app-common.dataset';
import { HttpClient } from '@angular/common/http';

import * as appConfig from '../../assets/config/cfg.json';

/**Application tables *****/
/*
import { TblParent, TblParentRow, TblUsers, TblAnomalies, TblTreeStrucRow } from './app.tables';
*/
//<INCLUDES>
import { TblAnomaliesAction, TblAnomaliesActionRow } from './app.tables';
import { TblAnomalies, TblAnomaliesRow } from './app.tables';
import { TblAnomaliesArchive, TblAnomaliesArchiveRow } from './app.tables';
import { TblAnomaliesSub, TblAnomaliesSubRow } from './app.tables';
import { TblAnomalyTypes, TblAnomalyTypesRow } from './app.tables';
import { TblCompliance, TblComplianceRow } from './app.tables';
import { TblChangeTracker, TblChangeTrackerRow } from './app.tables';
import { TblChemDBBAC, TblChemDBBACRow } from './app.tables';
import { TblChemDBcorr, TblChemDBcorrRow } from './app.tables';
import { TblChemDBGAP, TblChemDBGAPRow } from './app.tables';
import { TblChemDBglycol, TblChemDBglycolRow } from './app.tables';
import { TblChemDBHeader, TblChemDBHeaderRow } from './app.tables';
import { TblChemDBHFA, TblChemDBHFARow } from './app.tables';
import { TblChemDBowa, TblChemDBowaRow } from './app.tables';
import { TblChemDBpwa, TblChemDBpwaRow } from './app.tables';
import { TblChemDBQUAL, TblChemDBQUALRow } from './app.tables';
import { TblChemDBrsd, TblChemDBrsdRow } from './app.tables';
import { TblChemDBscale, TblChemDBscaleRow } from './app.tables';
import { TblChemDBSubModule, TblChemDBSubModuleRow } from './app.tables';
import { TblChemDBtreat, TblChemDBtreatRow } from './app.tables';
import { TblChemDBwhru, TblChemDBwhruRow } from './app.tables';
import { TblChemDBwhruwater, TblChemDBwhruwaterRow } from './app.tables';
import { TblChemDBwqa, TblChemDBwqaRow } from './app.tables';
import { TblDesignData, TblDesignDataRow } from './app.tables';
import { TblDesignDataHistory, TblDesignDataHistoryRow } from './app.tables';
import { TblDesignDataKP, TblDesignDataKPRow } from './app.tables';
import { TblDesignDataParams, TblDesignDataParamsRow } from './app.tables';
import { QryDevMain, QryDevMainRow } from './app.tables';
import { TblFailureThreats, TblFailureThreatsRow } from './app.tables';
import { SysLocks, SysLocksRow } from './app.tables';
import { TblLookups, TblLookupsRow } from './app.tables';
import { TblMatrix, TblMatrixRow } from './app.tables';
import { TblNodesAttrib, TblNodesAttribRow } from './app.tables';
import { TblUserParam, TblUserParamRow } from './app.tables';
import { TblRefFiles, TblRefFilesRow } from './app.tables';
import { TblSeismic, TblSeismicRow } from './app.tables';
import { TblSurvey, TblSurveyRow } from './app.tables';
import { TblSurveyEvent, TblSurveyEventRow } from './app.tables';
import { TblSurveyHeader, TblSurveyHeaderRow } from './app.tables';
import { TblSurveyPosition, TblSurveyPositionRow } from './app.tables';
import { TblTreeStruc, TblTreeStrucRow } from './app.tables';
import { TblUsers, TblUsersRow } from './app.tables';
import { QrySpansCampaign, QrySpansCampaignRow } from './app.tables';
import { QrySpansHeader, QrySpansHeaderRow } from './app.tables';
import { QryRefLinks, QryRefLinksRow } from './app.tables';
//</INCLUDES>

export class AppDataset extends DatasetBase {
  DEBUG_MODE: boolean = false;

  APP_TITLE: string = 'My Application';
  APP_ICON: string = 'fa-id-card';

  NAV_BACK: string = '#2b579a';

  TREE_LOC_LEVEL_PART: number = 2;

  fileUploader: FileUploaderComponent = null;
  showUploadStatus() {
    if (this.fileUploader) this.fileUploader.show();
  }
  hideUploadStatus() {
    if (this.fileUploader) this.fileUploader.hide();
  }

  private _globalMessage: {} = {};
  public get globalMessage(): {} {
    return this._globalMessage;
  }
  public set globalMessage(value: {}) {
    if (!value) {
      this._globalMessage = {};
      return;
    }
    for (let key in value) {
      this._globalMessage[key] = value[key];
    }
  }

  testRow: any = {
    table: {},
    an_id: 1,
  };

  constructor(
    public http: HttpClient,
    public apiCommon: AppCommonMethodsService,
    // public dialog: MatDialog,
    public data?: any,
    private appMainServiceService?: AppMainServiceService
  ) {
    super(http, apiCommon, null, data);

    this.InitDS();

    //<RELATIONS>
    this.tblAnomalies.tableRelations.push(new Relation("lkp", "lkp", this.tblAnomalies, this.tblLookups, "AN_STATUS", "LKP_ID", false));
    this.tblAnomalies.tableRelations.push(new Relation("node", "lkp", this.tblAnomalies, this.tblNodesAttrib, "AN_ASSET_ID", "REC_TAG", false));
    this.tblCompliance.tableRelations.push(new Relation("node", "lkp", this.tblCompliance, this.tblNodesAttrib, "CA_REC_TAG", "REC_TAG", false));
    this.tblChemDBHeader.tableRelations.push(new Relation("lkp", "lkp", this.tblChemDBHeader, this.tblLookups, "AN_STATUS", "LKP_ID", false));
    this.tblChemDBHeader.tableRelations.push(new Relation("node", "lkp", this.tblChemDBHeader, this.tblNodesAttrib, "AN_ASSET_ID", "REC_TAG", false));
    this.tblDesignData.tableRelations.push(new Relation("node", "lkp", this.tblDesignData, this.tblNodesAttrib, "DD_ASSET", "REC_TAG", false));
    this.tblNodesAttrib.tableRelations.push(new Relation("an", "1tom", this.tblNodesAttrib, this.tblAnomalies, "REC_TAG", "AN_ASSET_ID", true));
    this.tblSurveyHeader.tableRelations.push(new Relation("node", "lkp", this.tblSurveyHeader, this.tblNodesAttrib, "SVY_HDR_NOD_ID", "REC_TAG", false));
    this.tblTreeStruc.tableRelations.push(new Relation("node", "1to1", this.tblTreeStruc, this.tblNodesAttrib, "TRE_DAT_TAG", "", false));
    this.tblTreeStruc.tableRelations.push(new Relation("tre", "1tom", this.tblTreeStruc, this.tblTreeStruc, "", "TRE_NOD_TAG_PAR", true));
    this.tblTreeStruc.tableRelations.push(new Relation("desdat", "1tom", this.tblTreeStruc, this.tblDesignData, "TRE_DAT_TAG", "DD_ASSET", true));
    this.tblTreeStruc.tableRelations.push(new Relation("an", "1tom", this.tblTreeStruc, this.tblAnomalies, "TRE_DAT_TAG", "AN_ASSET_ID", true));
    this.tblTreeStruc.tableRelations.push(new Relation("rf", "1tom", this.tblTreeStruc, this.tblRefFiles, "TRE_DAT_TAG", "RF_ASSET", true));
    this.tblTreeStruc.tableRelations.push(new Relation("svyhdr", "1tom", this.tblTreeStruc, this.tblSurveyHeader, "TRE_DAT_TAG", "SVY_HDR_NOD_ID", true));
//</RELATIONS>

    //<DECLARE>
  this.apiCommon.PARAMS_DELIM_CHAR = '`';
  this.apiCommon.PARAMS_VAL_DELIM_CHAR = ',';
  this.apiCommon.FIELD_PARENT_LINK_ALIAS = 'lnk_id';
  this.apiCommon.FIELD_CHILD_FIRST_ALIAS = 'lnk_child_first';
  this.apiCommon.FIELD_CHILD_COUNT_ALIAS = 'lnk_child_count';
  //</DECLARE>
  }

  async InitDS() {
    const ustr: string = localStorage.getItem('userInfo');
    if (ustr) {
      const uinf: IUserInfo = JSON.parse(ustr);
      if (uinf.logged) {
        this.userInfo.key = uinf.key;
        this.userInfo.id = uinf.id;
        this.userInfo.name = uinf.name;
        this.userInfo.logged = uinf.logged;
        this.userInfo.rights = uinf.rights;
        this.userInfo.phone = uinf.phone;
        this.userInfo.email = uinf.email;
        this.isAuthenticated = true;
      }
    }
  }

  //<INSTANTIATE>
  public tblAnomaliesAction:TblAnomaliesAction = this.AddTable(new TblAnomaliesAction(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblAnomalies:TblAnomalies = this.AddTable(new TblAnomalies(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblAnomaliesArchive:TblAnomaliesArchive = this.AddTable(new TblAnomaliesArchive(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblAnomaliesSub:TblAnomaliesSub = this.AddTable(new TblAnomaliesSub(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblAnomalyTypes:TblAnomalyTypes = this.AddTable(new TblAnomalyTypes(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblCompliance:TblCompliance = this.AddTable(new TblCompliance(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChangeTracker:TblChangeTracker = this.AddTable(new TblChangeTracker(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBBAC:TblChemDBBAC = this.AddTable(new TblChemDBBAC(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBcorr:TblChemDBcorr = this.AddTable(new TblChemDBcorr(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBGAP:TblChemDBGAP = this.AddTable(new TblChemDBGAP(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBglycol:TblChemDBglycol = this.AddTable(new TblChemDBglycol(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBHeader:TblChemDBHeader = this.AddTable(new TblChemDBHeader(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBHFA:TblChemDBHFA = this.AddTable(new TblChemDBHFA(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBowa:TblChemDBowa = this.AddTable(new TblChemDBowa(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBpwa:TblChemDBpwa = this.AddTable(new TblChemDBpwa(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBQUAL:TblChemDBQUAL = this.AddTable(new TblChemDBQUAL(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBrsd:TblChemDBrsd = this.AddTable(new TblChemDBrsd(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBscale:TblChemDBscale = this.AddTable(new TblChemDBscale(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBSubModule:TblChemDBSubModule = this.AddTable(new TblChemDBSubModule(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBtreat:TblChemDBtreat = this.AddTable(new TblChemDBtreat(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBwhru:TblChemDBwhru = this.AddTable(new TblChemDBwhru(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBwhruwater:TblChemDBwhruwater = this.AddTable(new TblChemDBwhruwater(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblChemDBwqa:TblChemDBwqa = this.AddTable(new TblChemDBwqa(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblDesignData:TblDesignData = this.AddTable(new TblDesignData(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblDesignDataHistory:TblDesignDataHistory = this.AddTable(new TblDesignDataHistory(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblDesignDataKP:TblDesignDataKP = this.AddTable(new TblDesignDataKP(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblDesignDataParams:TblDesignDataParams = this.AddTable(new TblDesignDataParams(this.http, this.apiUrl, this.tables, this.apiCommon));
  public qryDevMain:QryDevMain = this.AddTable(new QryDevMain(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblFailureThreats:TblFailureThreats = this.AddTable(new TblFailureThreats(this.http, this.apiUrl, this.tables, this.apiCommon));
  public sysLocks:SysLocks = this.AddTable(new SysLocks(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblLookups:TblLookups = this.AddTable(new TblLookups(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblMatrix:TblMatrix = this.AddTable(new TblMatrix(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblNodesAttrib:TblNodesAttrib = this.AddTable(new TblNodesAttrib(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblUserParam:TblUserParam = this.AddTable(new TblUserParam(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblRefFiles:TblRefFiles = this.AddTable(new TblRefFiles(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblSeismic:TblSeismic = this.AddTable(new TblSeismic(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblSurvey:TblSurvey = this.AddTable(new TblSurvey(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblSurveyEvent:TblSurveyEvent = this.AddTable(new TblSurveyEvent(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblSurveyHeader:TblSurveyHeader = this.AddTable(new TblSurveyHeader(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblSurveyPosition:TblSurveyPosition = this.AddTable(new TblSurveyPosition(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblTreeStruc:TblTreeStruc = this.AddTable(new TblTreeStruc(this.http, this.apiUrl, this.tables, this.apiCommon));
  public tblUsers:TblUsers = this.AddTable(new TblUsers(this.http, this.apiUrl, this.tables, this.apiCommon));
  public qrySpansCampaign:QrySpansCampaign = this.AddTable(new QrySpansCampaign(this.http, this.apiUrl, this.tables, this.apiCommon));
  public qrySpansHeader:QrySpansHeader = this.AddTable(new QrySpansHeader(this.http, this.apiUrl, this.tables, this.apiCommon));
  public qryRefLinks:QryRefLinks = this.AddTable(new QryRefLinks(this.http, this.apiUrl, this.tables, this.apiCommon));
//</INSTANTIATE>

  /*
  this.tblTableClass = this.AddTable(new TblTableClass(this.http,this.apiUrl,this.tables));
  */

  /************************** Application Specific Declarations and Methods ****************************
  // constants
  *
  */

  /************************** Application Specific Declarations and Methods *****************************/
  // setup aplication source api url

  public get apiUrl(): string {
    return this.data.apiUrl;
    // if (this._apiUrl) return this._apiUrl;
    // return this.isDeployed
    //   ? appConfig.general.url_deploy
    //   : appConfig.general.url_local;
  }

  private _isAuthenticated: boolean = false;
  public get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  public set isAuthenticated(value: boolean) {
    this._isAuthenticated = value;
  }

  public get isDeployed(): boolean {
    return location.hostname != 'localhost' || appConfig.default.general.url_use_deploy;
  }

  private _debugTrace: Array<string> = [];
  public get debugTrace(): string {
    let ret: string = '';

    this._debugTrace.forEach((s) => (ret += (ret.length ? '\n' : '') + s));

    return ret;
  }
  public AddDebugTrace(newDebugTrace: string) {
    this._debugTrace.push(newDebugTrace);
  }

  public colorDefinitions: any = appConfig.default.general.color_defs;

  public get debugText(): string {
    return '<b>Debug:</b>';
  }

  private _errorObject: any = { type: '', trace: [] };
  public get errorObject(): any {
    return this._errorObject;
  }
  public clearError() {
    this._errorObject = { type: '', trace: [] };
  }

  public set errorObject(value: any) {
    let err: any = {};

    if (value.status == 500) {
      err.type = value.statusText;
      err.url = value.url;
      err.name = value.name;
      err.message = value.message;
      err.status = value.status;
    }
    this._errorObject = err;
  }

  public mainTreeData: Array<TreeViewNode> = [];
  public assetSelectorTreeData: Array<TreeViewNode> = [];

  public mainTreeColorLookup: Array<TblTreeStrucRow> = [];

  public moduleStates: Array<ModuleState> = [];
  DeleteState(moduleId: number) {
    if (this.moduleStates.length == 0) return;
    const idx: number = this.moduleStates.findIndex(
      (ms) => ms.moduleId == moduleId
    );
    if (idx != -1) {
      this.moduleStates[idx].Destroy();
      this.moduleStates.splice(idx, 1);
    }
  }
  ClearStates() {
    while (this.moduleStates.length)
      this.DeleteState(this.moduleStates[0].moduleId);
  }

  GetModuleState(moduleId: number): ModuleState {
    if (this.moduleStates.length == 0) return null;
    return this.moduleStates.find((ms) => ms.moduleId == moduleId);
  }

  //public rootNodeId: number = 4667; // spex
  private _currentTreeId: number = 1;
  public get currentTreeId(): number {
    return this._currentTreeId;
  }
  public set currentTreeId(value: number) {
    this._currentTreeId = value;
  }
  public get currentTreeDef(): any {
    return this.data.appTree.find((t) => t.tree_id == this.currentTreeId);
  }

  private _treeRootIndex: number = 0;
  public get treeRootIndex(): number {
    return this._treeRootIndex;
  }
  public set treeRootIndex(value: number) {
    this._treeRootIndex = value;
  }

  public get rootNodeId(): number {
    return this.currentTreeDef.roots[this.treeRootIndex].id;
  }
  public get rootNodeLocation(): string {
    return this.currentTreeDef.roots[this.treeRootIndex].location;
  }

  public mainTreeCurrentNode: any = {};

  public get currTreeNode(): TreeViewNode {
    return this.mainTreeData.find((r: TreeViewNode) => r.current);
  }

  public get isALV(): boolean {
    return this.DEBUG_MODE && this.userInfo.id == 'alv';
  }

  GetLockParams(tableCode: string, recordId: number): RequestParams {
    return {
      code: 'lk',
      snapshot: true,
      filter: `({LOCK_TABLE_CODE|eq|"${tableCode}"}^
              {LOCK_RECORD_ID|eq|${recordId}}^
              {LOCK_END|eq|null})`,
    };
  }

  LockRecord(tableCode: string, recordId: number, onSuccess: Function): void {

    this.SetCurrentServerTime();

    // 2021-04-07T14:47:45

    const formData: any = {
      lk: [
        {
          LOCK_ID: -1,
          LOCK_TABLE_CODE: tableCode,
          LOCK_RECORD_ID: recordId,
          LOCK_USER_NAME: this.userInfo.name,
          LOCK_START: this.apiCommon.dateToString(
            this.csInfo.serverCurrentStamp
          ),
        },
      ],
    };

    console.log("LockDate:", formData)

    const subs = this.Post(formData).subscribe(
      (data) => {
        onSuccess(data);
        subs.unsubscribe();
      },
      (err) => {
        console.log('Error locking record: ', err);
      }
    );
  }

  UnlockRecordByLockId(lockId: number, onSuccess?: Function): void {
    const formData: any = {
      lk: [
        {
          LOCK_ID: lockId,
          LOCK_END: this.apiCommon.dateToString(this.csInfo.serverCurrentStamp),
        },
      ],
    };

    const subs = this.Post(formData).subscribe(
      (data) => {
        if (onSuccess) onSuccess(data);
        subs.unsubscribe();
      },
      (err) => {
        console.log('Error locking record: ', err);
      }
    );
  }

  UnlockRecord(tableCode: string, recordId: number): void { }


  Logout() {
    this.userInfo.name = 'Visitor';
    this.userInfo.id = '';
    this.userInfo.logged = false;
    this.isAuthenticated = false;
    localStorage.removeItem('userInfo');
  }

  // read setup configuration properties
  private _menuList: Array<any> = null;
  public get menuList(): Array<any> {
    if (!this._menuList) {
      this.cl(['USER INFO', this.userInfo]);
      this._menuList = appConfig.default.app_menu;

      if (this.isALV) {
        const mItem = this._menuList.find((m) => m.id == 1);
        const smItem = mItem.subMenu.find((sm) => sm.id == 1);
        console.log('\nMenu Item:', smItem);
        if (smItem) smItem.active = true;
      }
    }
    return this._menuList;
  }


  private _ReportList: Array<any> = null;
  public get ReportList(): Array<any> {
    if (!this._ReportList) {
      this._ReportList = appConfig.default.Report_Data.List;
    }
    return this._ReportList;
  }



  public treeInitLocationPattern = this.isDeployed
    ? appConfig.default.tree_init_config.tree_location_filter_pattern_deploy
    : appConfig.default.tree_init_config.tree_location_filter_pattern;
  public extractNodeFields =
    appConfig.default.tree_init_config.tree_extract_node_fields;
  public extractTreeFields =
    appConfig.default.tree_init_config.tree_extract_tree_fields;

  public childExtractLevels(parentTreeLocation?: string): string {
    if (parentTreeLocation == undefined)
      parentTreeLocation = appConfig.default.tree_init_config.tree_root_location;

    const childLevels = appConfig.default.tree_init_config.tree_child_extract_levels;

    let ret: string = '';
    for (let idx = 1; idx <= childLevels; idx++) {
      ret += (idx > 1 ? ',' : '') + parentTreeLocation;
      for (let h = 1; h <= idx; h++) {
        ret += '__';
      }
    }
    return '"' + ret.replace(',', '","') + '"';
  }

  public parentImmediatChildren(
    childTreeLocation: string,
    exludeRoot?: boolean
  ): string {
    if (exludeRoot == undefined) exludeRoot = true;
    let ret: string = '';
    return ret;
  }

  openSnackBar(
    message: string,
    action?: string,
    duration?: number,
    horizontalPosition?: any,
    verticalPosition?: any
  ): void {
    this.appMainServiceService.openSnackBar(
      message,
      action,
      duration,
      horizontalPosition,
      verticalPosition
    );
  }

  public get constUISettings(): any {
    return {
      center: CellTextAlign.CENTER,
      right: CellTextAlign.RIGHT,
      minShort: 80,
      minLong: 180,
      minMemo: 250,
      wd1: 40,
      wd2: 50,
      wd3: 60,
      wd4: 80,
      wd5: 100,
      wd6: 120,
    };
  }

  public get dateFormats(): {
    short?: string;
    shortWithTime?: string;
    shortLongYear?: string;
    shortLongYearWithTime?: string;
  } {
    return {
      short: 'DD-MMM-YY',
      shortWithTime: 'DD-MMM-YY hh:mm:ss a',
      shortLongYear: 'DD-MMM-YYYY',
      shortLongYearWithTime: 'DD-MMM-YYYY hh:mm:ss a',
    };
  }

  public get toggleYesNo(): Array<any> {
    return [
      { value: 1, display: 'Yes' },
      { value: 0, display: 'No' },
    ];
  }

  public get toggleYesNoNA(): Array<any> {
    return [
      { value: 1, display: 'Yes' },
      { value: 0, display: 'No' },
      { value: null, display: '-' },
    ];
  }

  //*********************** Common Data Filter by Tree Location *****************************************/
  // dictionary of filtered table data array where keys are set to the tableCode
  private _subData = {};
  // dictionary of asset id where keys are set to the tableCode
  private _prevAsset = {};

  //***************************** Extract data *********************************/
  private _mainData: any = {};

  public TimeVars: any = {};

  private _processingTreeColorData: boolean = false;

  private _treeColorData: Array<{ location: string; status: number }> = [];
  public get treeColorData(): Array<{ location: string; status: number }> {
    /*********************************************************************
     * Extracts tree color records based on integrity status
     **********************************************************************/
    if (this._treeColorData.length == 0 && !this._processingTreeColorData) {
      this.Get(
        [
          {
            code: 'tre|-an,TRE_DAT_TAG,AN_ASSET_ID',
            includedFields:
              'TRE_NOD_LOC`max(AN_ORIG_CLASS)@MAX_ORIG`max(AN_CURR_CLASS)@MAX_CURR',
            filter: `{TRE_DAT_TYPE|${this.currentTreeId}}^({AN_DELETED|0}|{AN_DELETED|null})`,
            snapshot: true,
          },
        ],
        {
          onSuccess: (result) => {
            let tempColor: Array<{ location: string; status: number }> = [];
            result.processed.data[0].forEach((r: any) => {
              tempColor.push({
                location: r.TRE_NOD_LOC,
                status: r.XTRA.MAX_CURR,
              });
            });
            this._treeColorData = tempColor;
          },
          onError: (err) => {
            console.log('Error extracting color data.', err);
          },
        }
      );
    }
    return this._treeColorData;
  }

  public set treeColorData(value: Array<{ location: string; status: number }>) {
    if (!value) value = [];
    this._treeColorData = value;
  }

  public get appVersionObject(): IAppVersion {
    return appConfig.default.general.app_version;
  }

  private _riskMatrixData: any;
  public get riskMatrixData(): any {
    // forms risk matrix lookup data object which is used in the
    // creation of the risk matrix component grid
    if (this._riskMatrixData != undefined) return this._riskMatrixData;

    if (this._riskMatrixData == undefined) {
      const lik = this.GetLookupItems(147);
      const sev = this.GetLookupItems(148);
      const mtx = this.GetLookupItems('mtx', {
        key: 'MTX_ID',
        // temporarily store likelihood and severity id in code separated by comma
        code: '`{MTX_SEV_LKP_ID},{MTX_LIK_LKP_ID}`',
        back: 'MTX_BACK',
        fore: 'MTX_FORE',
      });

      const riskData: {
        lik: Array<ILookupItem>;
        sev: Array<ILookupItem>;
        mtx: {};
      } = { lik: [], sev: [], mtx: {} };

      if (lik.length != 0 && sev.length != 0) {
        // assign severity and likelihood lookup data
        riskData.sev = sev;
        riskData.lik = lik;

        // process matrix lookup data
        mtx.forEach((mx) => {
          // lookup likelihood and severity codes split code of the matrix record
          const sevlikIds = mx.code.split(',');
          riskData.mtx['M' + mx.key] = {
            fore: mx.fore,
            back: mx.back,
            code: `${this.GetLookupValue(
              sev,
              +sevlikIds[0],
              'code',
              'key'
            )}${this.GetLookupValue(lik, +sevlikIds[1], 'code', 'key')}`,
          };
        });

        this._riskMatrixData = riskData;
      } else {
        return null;
      }

      return riskData;
    }
  }

  public _AppLookupData: any = {};
  public GetLookupItems(
    key: any,
    mapInfo?: ILookupMapInfo,
    sort?: string,
    filter?: string
  ): Array<ILookupItem> {
    // form lookup key
    key = isNaN(+key) ? key : 'lkp' + key;

    // get cached raw lookup source
    const lkp = this._AppLookupData[key];

    if (sort) {
    }
    if (filter) {
    }

    if (!lkp) return [];

    if (mapInfo == undefined) {
      // assume to be a group in the composite lookup table
      mapInfo = {
        key: 'LKP_ID',
        text: 'LKP_DESC_B',
        code: 'LKP_DESC_A',
        back: 'LKP_TEXT_50_1',
        fore: 'LKP_TEXT_50_2',
        sw1: 'LKP_BOOLEAN_1',
        sw2: 'LKP_BOOLEAN_2',
        sw3: 'LKP_BOOLEAN_3',
        settings: 'LKP_MEMO_1',
      };
    }

    const items: Array<ILookupItem> = [];
    lkp.forEach((r) => {
      let item: ILookupItem = { key: r[mapInfo.key] };

      // Column: text
      if (mapInfo.text) item.text = r[mapInfo.text];

      // Column: code
      if (mapInfo.code) {
        if (mapInfo.code.indexOf('`') == 0) {
          // replace all '{' characters with "${r." then evaluate expression
          const fmt = mapInfo.code.replace(/\{/gi, '${r.');
          item.code = eval(fmt);
        } else {
          item.code = r[mapInfo.code];
        }
      }

      // Column: back
      if (mapInfo.back) item.back = r[mapInfo.back];
      // Column: fore
      if (mapInfo.fore) item.fore = r[mapInfo.fore];

      // Column: group
      if (mapInfo.group) item.group = r[mapInfo.group];

      // Column: sw1
      if (mapInfo.sw1) item.sw1 = r[mapInfo.sw1];

      // Column: sw2
      if (mapInfo.sw2) item.sw2 = r[mapInfo.sw2];

      // Column: sw3
      if (mapInfo.sw3) item.sw3 = r[mapInfo.sw3];

      // Column: settings
      if (mapInfo.settings) item.settings = r[mapInfo.settings];

      items.push(item);
    }); // for each (r)

    return items;
  } // GetLookupItems-end

  public GetLookupItem(
    lookupObject: Array<any>,
    keyValue: any,
    keyField?: string
  ): any {
    if (!keyField) keyField = 'key';
    return lookupObject.find((e) => {
      return e[keyField] == keyValue;
    });
  }

  public GetLookupValue(
    lookupObject: Array<any>,
    keyValue: any,
    displayField?: string,
    keyField?: string
  ): any {
    const item = this.GetLookupItem(lookupObject, keyValue, keyField);
    if (!item) return keyValue;

    if (!displayField) displayField = 'code';
    return item[displayField];
  }

  public RequestLookup(args: any) { }

  public SetLookupData(
    args: Array<{
      tableCode?: string;
      fields?: string;
      filterField?: string;
      filterValue?: number;
    }>,
    onSuccess?: Function,
    onError?: Function
  ) {
    // console.log("\nDataSet.SetLookupData ..." , args)

    let reqParams: Array<RequestParams> = [];
    args.forEach((e) => {
      let proceed: boolean = true;
      let { tableCode, fields, filterField, filterValue } = e;
      if (filterValue) {
        // table code is not supplied... set 'lkp' as default
        if (tableCode == undefined) tableCode = 'lkp';

        // if filter field is not defined and tableCode is 'lkp', set filterField = LKP_GRP_ID
        if (filterField == undefined && tableCode == 'lkp')
          filterField = 'LKP_GRP_ID';
        // if lookup fields are not specified, and tableCode is 'lkp'
        // set default lookup field as
        // 'LKP_ID,LKP_GRP_ID,LKP_DESC_A,LKP_DESC_B,LKP_TEXT_50_1,LKP_TEXT_50_2'
        //  mapped as ...
        // key: 'LKP_ID',
        // text: 'LKP_DESC_B',
        // code: 'LKP_DESC_A',
        // back: 'LKP_TEXT_50_1',
        // fore: 'LKP_TEXT_50_2',
        // settings: 'LKP_MEMO_1',

        if (fields == undefined && tableCode == 'lkp') {
          fields =
            'LKP_ID,LKP_GRP_ID,LKP_DESC_A,LKP_DESC_B,LKP_TEXT_50_1,LKP_TEXT_50_2,LKP_BOOLEAN_1,LKP_BOOLEAN_2,LKP_BOOLEAN_3,LKP_MEMO_1';
        }
      }

      if (
        tableCode != undefined &&
        !(tableCode == 'lkp' && filterValue == undefined)
      ) {
        // process only if table code is defined and if table code is 'lkp' a filter value must be supplied
        filterField =
          filterField != undefined && filterValue != undefined
            ? `{${filterField}|${filterValue}}${tableCode == 'lkp' ? '^{LKP_DESC_B|neq|null}' : ''}`
            : undefined;

        reqParams.push({
          code: tableCode,
          includedFields: fields ? fields.replace(/,/gi, '`') : undefined,
          filter: filterField,
          snapshot: true,
        });
      } else {
        // console.log('invalid parameters',args);
      }
    });

    if (reqParams.length) {
      this.Get(reqParams, {
        onSuccess: (ret) => {
          const { raw, processed, config } = ret;

          // distribute table rows to individual lookup keys
          for (let idx = 0; idx < processed.data.length; idx++) {
            let key: string = '';
            const arg = args[idx];
            let { tableCode, fields, filterField, filterValue } = arg;

            const rows = processed.data[idx];

            // this is normally the table code
            const code = raw[idx].returnCode;

            if (code == 'lkp') {
              // if lookup type
              if (rows.length) {
                // get group identity and append it to the table code
                const firstRow = rows[0];
                key = code + firstRow.LKP_GRP_ID;
              }
            } else {
              key = code + (filterValue ? '_' + filterValue : '');
            }

            // if key value is formed from the request return results
            if (key) this._AppLookupData[key] = rows;
          }

          if (onSuccess)
            onSuccess({ raw: ret, rawLookups: this._AppLookupData });
        },
        onError: (err) => {
          this.globalMessage = {
            error: true,
            message: 'Error occured in GetAppLookupData',
            errorObj: err,
          };
          console.log('GetLookupData Error:', err);
          if (onError) onError(err);
        },
      });
    }
  }

  AssetSearch(searchFor: any, treeView: TreeViewComponent) {
    const treeData = treeView.treeData;

    if (!isNaN(+searchFor)) {
      // numeric value, search for a single value
    }
  }

  SearchTreeDirectChildren(e: {
    location: string;
    parents: Array<string>;
    treeView: TreeViewComponent;
    feedback: Function;
  }) {
    const { location, parents, treeView, feedback } = e;

    this.GetTreeData({
      treeView: treeView,
      searchParents: parents,
      onSuccess: (results: any) => {
        if (feedback) feedback(location, treeView);
        //console.log('PARENT CHILD NODES', results);
      },
    });

    // build filter expression...

    // parse location

    /**
     *         this.selectSearchedItem.emit({
          location:loc,
          parents: parents,
          treeView: this,
          feedback: this.SetCurrentNode,
        });
     */
  }

  SearchTree(e: {
    searchText: string;
    treeView: TreeViewComponent;
    feedback: Function;
  }) {
    const { searchText, treeView, feedback } = e;
    const withWild = searchText.indexOf('%') != -1;
    const withExact = searchText.substring(0, 1) == '!';

    const formattedSearch = withWild
      ? searchText
      : withExact
        ? searchText.substring(1)
        : `%${searchText}%`;

    // const filter = `{TRE_DAT_TYPE|${this.currentTreeId}}^({NODE_ID|${
    //   withExact ? 'eq' : 'lk'
    // }|"${formattedSearch}"}||{NODE_DESC|${
    //   withExact ? 'eq' : 'lk'
    // }|"${formattedSearch}"})`;

    const filter = `{TRE_DAT_TYPE|${this.currentTreeId}}^({NODE_ID|${withExact ? 'eq' : 'lk'
      }|"${formattedSearch}"}|{NODE_DESC|${withExact ? 'eq' : 'lk'
      }|"${formattedSearch}"})`;

    this.Get(
      [
        {
          code: 'node|-tre,REC_TAG,TRE_DAT_TAG;',
          filter: filter,
          includedFields: 'REC_TAG`NODE_DESC`NODE_ID`TRE_NOD_TAG`TRE_NOD_LOC',
          snapshot: true,
        },
      ],
      {
        onSuccess: (args) => {
          if (feedback) {
            let data: Array<TreeViewNode> = [];
            const arr = args.processed.data[0].sort((a, b) => {
              // sort in descending order
              return a.NODE_ID > b.NODE_ID ? 1 : b.NODE_ID > a.NODE_ID ? -1 : 0;
            });

            arr.forEach((r) => {
              data.push(
                new TreeViewNode(
                  r.XTRA.TRE_NOD_TAG,
                  -1,
                  r.REC_TAG,
                  r.NODE_ID,
                  r.NODE_DESC,
                  false,
                  false,
                  0,
                  r.XTRA.TRE_NOD_LOC,
                  undefined,
                  treeView
                )
              );
            });

            feedback({ data: data, treeView: treeView });
          }
        },
      }
    );
  }

  GetTreeData(params: {
    treeView: TreeViewComponent;
    parentNode?: TreeViewNode;
    searchParents?: Array<string>;
    onSuccess?: Function;
    onError?: Function;
  }) {
    this.clearError();

    const { treeView, parentNode, searchParents, onSuccess, onError } = params;
    const initial = parentNode == undefined && !searchParents;

    const treeDataObject = treeView.treeData;

    let filter: string = '';
    if (initial) {
      // extract inital set of nodes on the tree
      filter = `({TRE_NOD_LOC|in|"${this.rootNodeLocation}","${this.rootNodeLocation}__"})`;
    } else if (searchParents) {
      // extract immediate children of parent(s) of selected node (given node location)
      // build parent filter expression
      let pars: string = '';
      searchParents.forEach((par) => {
        pars += (pars.length ? ',' : '') + par + '__';
      });
      filter = `({TRE_NOD_LOC|in|${`"${pars.replace(/,/gi, '","')}"`}})`;
    } else {
      // extract children nodes from the selected parent node
      filter = `({TRE_NOD_LOC|in|${this.childExtractLevels(parentNode.loc)}})`;
      parentNode.isChildNodesLoading = true;
    }

    this.Get(
      [
        // Tree Struc
        {
          code:
            'tre|`tre@chi,TRE_NOD_TAG,TRE_NOD_TAG_PAR;-node,TRE_DAT_TAG,REC_TAG;',
          filter: filter,
          includedFields:
            this.extractTreeFields +
            '`count(chi.TRE_NOD_TAG)@CHI_NODE_COUNT`NODE_ID`NODE_DESC',
          snapshot: true,
        },
      ],
      {
        onSuccess: (args) => {
          // reset child loading flag if parentNode is supplied
          if (parentNode) parentNode.isChildNodesLoading = false;

          // initialize tree data source, clear all nodes
          if (initial) treeDataObject.splice(0, treeDataObject.length);

          // DO NOT PUT ANY REFERENCE TO this.treeView INSIDE THE
          // this.ds.tblTreeStruc.rows.forEach LOOP this will
          // RUIN THE AUTO REFRESH OF THE BROWSER !!!!!
          const expArr = [treeView.rootId];

          // iterate through all rows in the tblTreeStruc table
          args.processed.data[0].forEach((r) => {
            let pushIt: boolean = initial;
            if (!pushIt) {
              // if NOT initial data extraction, search for the node and
              // make sure that the node data is not yet existing.
              pushIt = !treeDataObject.find((e) => e.id == r.TRE_NOD_TAG);
            }

            // add tree node data
            if (pushIt)
              treeDataObject.push(
                new TreeViewNode(
                  r.TRE_NOD_TAG, // id - node id
                  r.TRE_NOD_TAG_PAR, // pid - parent id
                  r.TRE_DAT_TAG, // did - data id
                  r.XTRA.NODE_ID, // code - short text
                  r.XTRA.NODE_DESC, // text - long text
                  expArr.indexOf(r.TRE_NOD_TAG) != -1, // exp - expanded
                  false, // current -  current selected node flag
                  r.XTRA.CHI_NODE_COUNT ? r.XTRA.CHI_NODE_COUNT : r.childCount, // ccnt - children node count
                  r.TRE_NOD_LOC,
                  undefined,
                  treeView // loc - node location code on tree
                )
              );
          });

          if (onSuccess != undefined) onSuccess(args);

          // setTimeout(() => {
          //   // refresh tree
          //   // need to use setTimeout method for the treeView.ProcessTree() method to work properly!
          //   treeView.ProcessTree();
          // }, 50);

          // end of onSuccess
        },
        onError: (err) => {
          // process error result
          this.errorObject = err;
          this.globalMessage = {
            error: true,
            message: 'Error occured in GetTreeData',
            errorObj: err,
          };

          if (onError != undefined) onError(err);
        },
      }
    );
  }
}

export class ModuleState {
  constructor(_moduleId: number) {
    this.moduleId = _moduleId;
    if (this.moduleId == 1) this.filteringActive = true;
  }

  public moduleId: number;

  public gridSourceLookups: any; // Array<any>;

  public gridDataSource: Array<any> = [];
  public gridCurrentRowIndex: number = -1;
  public gridActiveRow: any = { active: true };

  public gridCurrentRow: any = { temp: true };

  public currentRow: any = null;
  public currentNode: TreeViewNode = null;

  public mainGridOptions: DataGridOption = new DataGridOption([]);
  public mainTabsOptions: DataTabsOption = new DataTabsOption([]);
  public mainFormObject: FormGroup = new FormGroup({});
  public mainFormCollection: Array<AppFormAComponent> = [];
  public mainRecordsBuffer: Array<any> = [];

  public setupDataCalled: boolean = false;

  public filteringActive: boolean = false;

  Destroy(): void {
    // clear all arrays
    this.mainFormCollection = [];
    this.mainRecordsBuffer = [];
    this.gridDataSource = [];
    this.gridSourceLookups = {};

    // delete this.mainGridOptions;
    // delete this.mainTabsOptions;
    // delete this.mainFormObject;

    // delete this.currentNode;
    // delete this.currentRow;
  }
}

export interface IAccessRights {
  allowCampEvt?: boolean;//Neo 20210413
  allowEdit?: boolean;
  allowAdd?: boolean;
  allowDelete?: boolean;
  allowPrint?: boolean;
  allowExcel?: boolean;
  allowManage?: boolean;
  allowSelect?: boolean;
  allowShowSelect?: boolean;
}

export enum UserParamLookupGroup {
  Password = 8002,
  Login = 8000,
  Title = 8004,
  Rights = 8001,
  Group = 8006,
  TA = 8008,
  Email = 8003,
}
