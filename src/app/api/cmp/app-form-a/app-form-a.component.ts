import { SysLocksRow } from './../../../svc/app.tables';
import { FileUploaderComponent } from './../file-uploader/file-uploader.component';
import { HttpEventType } from '@angular/common/http';
import { TreeViewNode } from './../tree-view/tree-view.component';
import { LocationSelectorComponent } from './../../../cmp/location-selector/location-selector.component';
import {
  IDataChanged,
  IUserInfo,
  ITreeTableConfig,
  ILookupTableConfig,
  IRegularTableConfig,
} from './../../mod/app-common.classes';

import { ModuleExchangeInfo } from './../../../cmp/module.common';
import { PromptComponent } from './../prompt/prompt.component';
import { DetailsPopup, IPopupPrompts } from './../details.popup';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ColumnInfo } from './../../mod/app-column.model';
import { RequestParams, NodeFieldAliases } from './../../mod/app-params.model';
import { AppDataset } from './../../../svc/app-dataset.service';
import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  LOCALE_ID,
  Inject,
  AfterViewInit,
  Output,
  EventEmitter,
  KeyValueDiffers,
  KeyValueDiffer,
  ViewChild,
  ElementRef,
  ContentChild,
} from '@angular/core';
import { AppInputAComponent } from '../app-input-a/app-input-a.component';

@Component({
  selector: 'app-app-form-a',
  templateUrl: './app-form-a.component.html',
  styleUrls: ['./app-form-a.component.scss'],
})
export class AppFormAComponent implements OnInit, AfterViewInit, OnDestroy {
  /****************************************************************************
   this switch is necessary to prevent update to the current record when a global
   field values updates are being perfomed (e.g. Scatter() method)
   ****************************************************************************/
  public suspendControlChangeEvent: boolean = false;

  private destroyed: boolean = false;

  @ViewChild('FORM_WRAPPER') FORM_WRAPPER: ElementRef;

  // this section causes circular dependency issue
  // @ContentChild(FileUploaderComponent) fileUploader: FileUploaderComponent;
  // @ContentChild(FileUploaderComponent) uploader: FileUploaderComponent;

  @Input() formName: string;
  @Input() fileUploader: FileUploaderComponent;

  @Input() phBackSize: number = -1;
  @Input() phDuration: number = -1;

  @Input() controlHeight: number = 22;
  @Input() labelWidth: number = 130;
  @Input() rowSpacing: number = 2;
  @Input() excludes: Array<string> = [];

  @Input() readOnly: boolean = true;

  // private _readOnly: boolean = true;
  // @Input() set readOnly(value: boolean) {
  //   this._readOnly = value;
  // }

  // get readonly(): boolean {
  //   return this._readOnly;
  // }

  get locked(): boolean {
    // record is locked if the retieved lock record belongs to
    // another user
    return this.formLock
      ? this.formLock.LOCK_USER_NAME != this.DataSet.userInfo.name
      : false;
  }

  get lockedBy(): string {
    if (!this.locked) return '';
    return this.formLock ? this.formLock.LOCK_USER_NAME : '';
  }

  get lockedDateTime(): string {
    if (!this.locked) return '';
    return this.formLock
      ? this.DataSet.dateToString(new Date(this.formLock.LOCK_START), true)
      : '';
  }

  private _lockId: number = -1;
  get lockId(): number {
    return this._lockId;
  }

  @Input() defaultValues: any;
  @Input() defaultValuesSub: any;

  @Input() progress: number;

  public listRequery: boolean = false;

  // always require tree color reset when adding a new record
  public treeColorReset: boolean;

  private _isLoadingDetail: boolean = true;
  // private _isLoadingDetail: boolean = false;
  get isLoadingDetail(): boolean {
    return this._isLoadingDetail;
  }
  @Input() set isLoadingDetail(value: boolean) {
    this._isLoadingDetail = value;
  }

  public maskMessage: string = 'Loading details. Please wait';

  @Output() afterScatter: EventEmitter<any> = new EventEmitter();
  @Output() afterFormCreate: EventEmitter<any> = new EventEmitter();

  @Output() beforePosting: EventEmitter<any> = new EventEmitter();
  @Output() afterPosting: EventEmitter<any> = new EventEmitter();

  @Input() maskColor: string = 'white';
  @Input() maskOpacity: number = 0.3;
  @Input() maskFontFactor: number;

  moduleExchangeInfo: ModuleExchangeInfo;
  parent: any = null;
  inputs: Array<AppInputAComponent> = [];

  get prompts(): IPopupPrompts {
    if (!this.moduleExchangeInfo) return null;
    return this.moduleExchangeInfo.detailsObject.popPrompts;
  }

  private _DataSet: AppDataset = null;
  @Input() set DataSet(value: AppDataset) {
    // setTimeout(() => (this._DataSet = value));
    this._DataSet = value;
  }
  get DataSet(): AppDataset {
    // return this.dataSource.ActiveSource.appDataset
    return this._DataSet;
  }

  private _JoinExpression: string = null;
  private _TableCode: string = null;
  @Input() set TableCode(value: string) {
    const valArr = (value + '|').split('|');

    this._TableCode = valArr[0];
    this.JoinExpression = valArr[1];
  }

  private _TableConfig: IRegularTableConfig;
  get TableConfig(): IRegularTableConfig {
    if (!this.DataSet || !this.TableCode) return null;
    if (this._TableConfig == undefined) {
      const tbl = this.DataSet.tables[this.TableCode];
      if (!tbl) return null;
      this._TableConfig = tbl.TableConfig;

      // pending as of 2021-02-23 needs further study on this, meanwhile setting
      // on cfg.extraJoins and cfg.extraFields must be set to be used by details query params
      const xtra = this._TableConfig.extra;
      if (xtra) {
        if (!this._TableConfig.extraJoins || !this._TableConfig.extraFields) {
          const source = xtra.details
            ? xtra.details
            : xtra.gridColumns
              ? xtra.gridColumns
              : null;
          if (source) {
            if (source.joins && !this._TableConfig.extraJoins)
              this._TableConfig.extraJoins = source.joins;
            if (source.fields && !this._TableConfig.extraFields)
              this._TableConfig.extraFields = source.fields;
          }
        }
      } // pending...
    }
    return this._TableConfig;
  }

  get AssetField(): ColumnInfo {
    if (!this.sourceTable) return null;
    return this.sourceTable.AssetField;
  }

  get TableCode(): string {
    return this._TableCode;
  }

  @Input() set JoinExpression(value: string) {
    this._JoinExpression = value;
  }
  get JoinExpression(): string {
    return this._JoinExpression;
  }

  private _Extra: string = null;
  @Input() set Extra(value: string) {
    this._Extra = value;
  }

  get Extra(): string {
    return this._Extra;
  }

  private _JoinExpressionSub: string = null;
  private _TableCodeSub: string = null;
  @Input() set TableCodeSub(value: string) {
    const valArr = ((value ? value : '') + '|').split('|');

    this._TableCodeSub = valArr[0];
    this.JoinExpressionSub = valArr[1];
  }
  get TableCodeSub(): string {
    return this._TableCodeSub;
  }

  @Input() set JoinExpressionSub(value: string) {
    this._JoinExpressionSub = value;
  }
  get JoinExpressionSub(): string {
    return this._JoinExpressionSub;
  }

  private _ExtraSub: string = null;
  @Input() set ExtraSub(value: string) {
    this._ExtraSub = value;
  }

  get ExtraSub(): string {
    return this._ExtraSub;
  }
  /******************************** Form Objects declaration *********************************/
  // holds the reactive form parent group
  private _formObject: FormGroup = null;
  @Input() set formObject(value: FormGroup) {
    this._formObject = value;
    this.CheckExtra(this._formObject, this.sourceTable, this.formRow);
    this.AfterFormCreate(this.TableCode);
  }
  get formObject(): FormGroup {
    return this._formObject;
  }

  private _formObjectSub: FormGroup = null;
  @Input() set formObjectSub(value: FormGroup) {
    this._formObjectSub = value;
    this.CheckExtra(this._formObjectSub, this.sourceTableSub, this.formRowSub);
    this.AfterFormCreate(this.TableCodeSub);
  }
  get formObjectSub(): FormGroup {
    return this._formObjectSub;
  }

  AfterFormCreate(tableCode: string): void {
    if (!this.DataSet) return;
    if (!tableCode) return;

    const tbl: any = this.DataSet.tables[tableCode];
    if (!tbl) return;

    const tblCfg: IRegularTableConfig = tbl.TableConfig;
    const assetField: ColumnInfo = tbl.AssetField;

    const isMain: boolean = tableCode == this.TableCode;
    const isNew: boolean = this.AccessMode == 'add';
    const isEdit: boolean = this.AccessMode == 'edit';
    const isPop: boolean = isNew || isEdit;

    const currNode = this.DataSet.currTreeNode;

    const currentForm: AppFormAComponent = this.moduleExchangeInfo.detailsObject
      .form;
    const formObject: FormGroup = isMain
      ? this._formObject
      : this._formObjectSub;

    const frmCurr: FormGroup = isMain
      ? currentForm.formObject
      : currentForm.formRow;
    const rowCurr: FormGroup = isMain
      ? currentForm.formRow
      : currentForm.formRowSub;

    const delay = 30; // milliseconds

    if (isPop && !this.maskFontFactor) this.maskFontFactor = 1;

    this.maskMessage = isNew
      ? 'Initializing new record. Please wait...'
      : 'Loading details. Please wait...';

    if (isNew) {
      // set default values....
      const withCurrRow: boolean = rowCurr ? true : false;

      setTimeout(() => {
        // running the following codes inside setTimeout will address issue of not getting
        // any values assigned to form controls.
        if (assetField) {
          // if table contains the asset field
          const afld: string = assetField.name;
          const { NODE_LOCATION, NODE_TEXT, NODE_CODE } = this.nfa;

          // default asset id
          formObject
            .get(afld)
            .setValue(withCurrRow ? frmCurr.get(afld).value : currNode.did);

          // default tree location
          formObject
            .get(NODE_LOCATION)
            .setValue(
              withCurrRow ? frmCurr.get(NODE_LOCATION).value : currNode.loc
            );

          // default node description
          formObject
            .get(NODE_TEXT)
            .setValue(
              withCurrRow ? frmCurr.get(NODE_TEXT).value : currNode.text
            );

          // default node code
          formObject
            .get(NODE_CODE)
            .setValue(
              withCurrRow ? frmCurr.get(NODE_CODE).value : currNode.code
            );
        }

        // get default values set in the table's configuration file
        if (tblCfg.defaultValues) {
          for (let key in tblCfg.defaultValues) {
            formObject.get(key).setValue(tblCfg.defaultValues[key]);
          }
          if (this.defaultValues) {
            for (let key in this.defaultValues) {
              formObject.get(key).setValue(this.defaultValues[key]);
            }
          }
        }
        console.log('#### Form-A AfterFormCreate!',this.formRow);

        if (!this.formRow) {
          //console.log('Form row does not exist!')
          this.Requery()
        } else {
          console.log('Form row created!')
        }

        this.HideMask();
      }, delay); // end of setTimeout
    }

    setTimeout(
      () => {
        this.afterFormCreate.emit({
          // form containing the current selected row's data AppFormA
          currentForm: currentForm,
          // new form group object of the Add - AppFormAComponent
          form: formObject,
          // main table code
          code: tableCode,
          // Add - AppFormAComponent
          sender: this,
        })

      },
      (isNew ? delay : 0) + 5
    );
  }  // AfterFormCreate

  /******************************** Primary Table Source *********************************/
  private _sourceTable: any = null;
  @Input() set sourceTable(value: any) {
    this._sourceTable = value;
    if (!this.formObject && this.sourceTable.columns) {
      // ceate primary formObject out of the sourceTable object, is it is of the same type as DataTable class

      this.formObject = this.sourceTable.GetDataForm();

      // this.formObject.addControl('AN_TYPE_GROUP', new FormControl(null));

      // this.formObject = this.sourceTable.GetDataForm(
      //   // this.sourceRow ? this.sourceRow : undefined
      // );
    }
  }
  get sourceTable(): any {
    return this._sourceTable;
  }

  private _lockInfo: SysLocksRow;
  get lockInfo(): SysLocksRow {
    return this._lockInfo;
  }

  /******************************** Secondary Table Source *********************************/
  private _sourceTableSub: any = null;
  @Input() set sourceTableSub(value: any) {
    this._sourceTableSub = value;
    if (this.sourceTableSub)
      if (!this.formObjectSub && this.sourceTableSub.columns) {
        // ceate primary formObject out of the sourceTable object, is it is of the same type as DataTable class

        this.formObjectSub = this.sourceTableSub.GetDataForm(
          this.sourceRowSub ? this.sourceRowSub : undefined
        );
      }
  }
  get sourceTableSub(): any {
    return this._sourceTableSub;
  }

  CheckExtra(frm: FormGroup, sourceTable: any, row?: any): void {
    if (!frm) return;
    if (!sourceTable) return;
    const tblCfg: IRegularTableConfig = sourceTable.TableConfig;

    if (tblCfg.assetField) {
      // add controls for asset fields
      let nodeValue: any;

      let nodeCtrl: AbstractControl = frm.get(this.nfa.NODE_TEXT);
      if (!nodeCtrl) {
        nodeValue = row
          ? row.XTRA
            ? row.XTRA[this.nfa.NODE_TEXT]
            : null
          : null;
        frm.addControl(this.nfa.NODE_TEXT, new FormControl(nodeValue));
      }

      nodeCtrl = frm.get(this.nfa.NODE_CODE);
      if (!nodeCtrl) {
        nodeValue = row
          ? row.XTRA
            ? row.XTRA[this.nfa.NODE_CODE]
            : null
          : null;
        frm.addControl(this.nfa.NODE_CODE, new FormControl(nodeValue));
      }

      nodeCtrl = frm.get(this.nfa.NODE_LOCATION);
      if (!nodeCtrl) {
        nodeValue = row
          ? row.XTRA
            ? row.XTRA[this.nfa.NODE_LOCATION]
            : null
          : null;
        frm.addControl(this.nfa.NODE_LOCATION, new FormControl(nodeValue));
      }
    }

    if (tblCfg.extraFields) {
      const xtAarr: Array<string> = tblCfg.extraFields.split('`');
      xtAarr.forEach((xt) => {
        const fldArr = (xt + '@').split('@'); // to split field compoents from alias components
        const alArr = fldArr[1].split('^'); // to get field aliase and lookup alias reference
        const talArr = fldArr[0].split('.'); // to get table alias and fieldname

        const xtraField: string = alArr[0]
          ? alArr[0]
          : talArr[talArr.length - 1];

        const xtCtrl = frm.get(xtraField);
        if (!xtCtrl) {
          frm.addControl(xtraField, new FormControl(null));
        }
      });
    }

    // const groupCtrl = frm.get('ANTYPE_GROUP');
    // if (!groupCtrl) frm.addControl('ANTYPE_GROUP', new FormControl(null));

    if (!row) return;
    if (!row.XTRA) return;
    for (let key in row.XTRA) {
      const ctrl: AbstractControl = frm.get(key);
      const value = row.XTRA[key];
      if (!ctrl) frm.addControl(key, new FormControl(value));
      else ctrl.setValue(value);

    }

  }

  /******************************** Primary Row *********************************/
  private formRow: any = null;
  /******************************** Secondary Row *********************************/
  private formRowSub: any = null;
  /******************************** Lock Row *********************************/
  private formLock: any = null;
  /******************************** Primary Row Source *********************************/

  private _sourceRow: any = null;
  @Input() set sourceRow(value: any) {
    let src: any = value;

    this._sourceRow = src;
    if (value == null) return;

    if (!this.formObject) {
      const tbl = this._sourceRow.table;
      if (tbl) {
        // ceate primary formObject out of the sourceTable object,
        // is it is of the same type as DataTable class
        if (tbl.columns) {
          this.formObject = tbl.GetDataForm(this.sourceRow);
        }
      }
    }
    // set values of form controls to the new record's values
    // call for scatter is necessary when record is changed
    this.Scatter(true);
  }
  get sourceRow(): any {
    return this._sourceRow;
  }

  /******************************** Secondary Row Source *********************************/

  private _sourceRowSub: any = null;
  @Input() set sourceRowSub(value: any) {
    let src: any = value;

    this._sourceRowSub = src;

    const tbl = this._sourceRowSub.table;
    if (tbl) {
      if (!this._formObjectSub && tbl.columns) {
        // ceate primary formObject out of the sourceTable object, is it is of the same type as DataTable class
        // this._formObjectSub = tbl.GetDataForm(this._sourceRowSub);

        const frmObj: FormGroup = tbl.GetDataForm(this._sourceRowSub);
        if (this.Extra) {
          // add extra fields in the control
          const xtrArr = this.Extra.split('`');
          xtrArr.forEach((xtr) => {
            const fldExprArr = (xtr + '@').split('@');
            const fldName = fldExprArr[1] ? fldExprArr[1] : fldExprArr[0];
            if (!frmObj.get(fldName))
              frmObj.addControl(fldName, new FormControl(null));
          });
        }
        this._formObjectSub = frmObj;
      }
    }
  }
  get sourceRowSub(): any {
    return this._sourceRow;
  }
  /*************************** Data Key Value *****************************************/
  private _dataKeyValue: number = null;
  @Input() set dataKeyValue(value: number) {
    this._dataKeyValue = value;
  }
  get dataKeyValue(): number {
    return this._dataKeyValue;
  }

  /*************************** Record Type Value *****************************************/
  private _recordType: number = null;
  @Input() set recordType(value: number) {
    this._recordType = value;
  }
  get recordType(): number {
    return this._recordType;
  }

  /**************************************************************************************/

  private _isDataLoading: boolean = false;
  @Input() set isDataLoading(value: boolean) {
    this._isDataLoading = value;
  }
  get isDataLoading(): boolean {
    return this._isDataLoading;
  }

  public fieldsInitialized: Array<string> = [];

  differ: KeyValueDiffer<string, any>;
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private differs: KeyValueDiffers,
    private dialog: MatDialog // public dataSource: AppMainServiceService
  ) {
    this.differ = this.differs.find({}).create();
  }

  ngDoCheck() {
    const change = this.differ.diff(this);
    let process: boolean = false;
    if (change) {
      change.forEachChangedItem((item) => {
        const key = item.key;
        switch (key) {
          case '_DataSet':
          case '_TableCode':
          case '_TableCodeSub':
            this.SetupSources();
            break;

          case '_recordType':
            this.OnRecordTypeChanged();
            break;
          case '_dataKeyValue':
            this.Requery();
            break;

          case '_sourceRow':
            this.ScatterData();
            break;
          case '_sourceRowSub':
            this.ScatterDataSub();
            break;
          default:
            break;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    if (this._lockId != -1) {
      this.DataSet.UnlockRecordByLockId(this._lockId, (data) => {
        console.log(`Record lock ${this._lockId} released.`);
      });
    }

  }
  ngOnInit(): void { }
  ngAfterViewInit() {
    // setTimeout(()=>{
    //   console.clear();
    //   console.log("***** UPLOADER!!!: ",this.fileUploader)},5000)
  }

  get userInfo(): IUserInfo {
    return this.DataSet.userInfo;
  }

  get AccessMode(): string {
    if (!this.parent) return '';
    if (!this.parent.data) return '';
    return this.parent.data.AccessMode ? this.parent.data.AccessMode : '';
  }

  private _LinkedInputField: string;
  get LinkedInputField(): string {
    if (this._LinkedInputField != undefined) return this._LinkedInputField;

    if (!this.fileUploader) this._LinkedInputField = '';
    else if (!this.fileUploader.forUpload0.LinkedInput)
      this._LinkedInputField = '';
    else
      this._LinkedInputField = this.fileUploader.forUpload0.LinkedInput.fieldName;

    return this._LinkedInputField;
  }

  get withFile(): boolean {
    if (!this.fileUploader) return false;
    return this.fileUploader.forUpload0.files.length ? true : false;
  }

  private GetChanged(subTable?: boolean): IDataChanged {
    // get changed field(s) in formObject or formObjectSub

    const frm = !subTable ? this.formObject : this.formObjectSub;
    const row = !subTable ? this.formRow : this.formRowSub;

    const tbl = !subTable ? this.sourceTable : this.sourceTableSub;

    const fileFieldName: string = !subTable
      ? this.withFile
        ? this.LinkedInputField
        : ''
      : '';

    // console.log(
    //   '~~~~~~~ fileFieldName:: ',
    //   fileFieldName,
    //   'this.LinkedInputField: ',
    //   this.LinkedInputField
    // );

    let ret: IDataChanged = {
      data: {},
      stamps: {},
      table: tbl,
      row: row,
      form: frm,
    };

    if (!tbl) return ret;
    const tblCfg: IRegularTableConfig = tbl.TableConfig;
    const treeRecolorOnUpdateFields: Array<string> = (tblCfg.treeRecolorOnUpdate
      ? tblCfg.treeRecolorOnUpdate
      : ''
    ).split(',');

    if (!treeRecolorOnUpdateFields[0] && !subTable) this.treeColorReset = false;

    // console.log("\ntreeRecolorOnUpdateFields: ", treeRecolorOnUpdateFields,",  this.treeColorReset:",  this.treeColorReset,", tblCfg.treeRecolorOnUpdate: ",tblCfg.treeRecolorOnUpdate,"...",", tblCfg: ",tblCfg)

    let changed: boolean = false;

    tbl.columns.forEach((c: ColumnInfo) => {
      const ctl: AbstractControl = frm.get(c.name);

      if (row) {
        let ctlVal = ctl.value;
        if (ctlVal != row[c.name] || c.name == fileFieldName) {
          // if control value is not the same as value in the data row, set flag to changed and
          // add data to the return.data collection

          if (c.type == 'Date' && ctlVal) {
            // this.dateToString
            // this.DataSet.cl(['Name', c.name, 'value', ctlVal,"ds.dateToString",this.DataSet.dateToString(ctlVal)]);
            ctlVal = this.DataSet.dateToString(ctlVal);
          } else if (ctlVal == null || ctlVal == '') {
            // value to be determined when empty ... ????
          }

          changed = true;
          ret.data[c.name] = ctlVal;
          //
          if (!this.listRequery && !subTable)
            if (c.props.lookupgroup || c.props.lookuptable)
              // if requerying list flag is not yet set, check field changed if
              // requery of the entire list is necessary to update the display properly.
              // this is particularly necessary when a lookup type field is updated
              // i.e. col.props.lookupgroup or col.props.lookuptable is set in  the
              // configuration table
              this.listRequery = true;

          // check tree color reset
          if (this.AccessMode == 'add') this.treeColorReset = true;
          if (this.treeColorReset == undefined && !subTable) {
            if (treeRecolorOnUpdateFields.length != 0)
              if (treeRecolorOnUpdateFields.indexOf(c.name) != -1)
                // check if the field being changed will require tree recolor
                this.treeColorReset = true;
          }

          if (c.DateStampColumn)
            ret.stamps[c.DateStampColumn.name] = this.DataSet.dateStampString;

          if (c.UserStampColumn) {
            if (this.userInfo)
              // ret.stamps[c.UserStampColumn.name] = this.userInfo.id;
              ret.stamps[c.UserStampColumn.name] = this.userInfo.name;
          }
        }
      }
    });

    const accessMode = this.AccessMode;
    let col: ColumnInfo;

    if (changed) {
      // set additional stamps

      if (accessMode == 'add') {
        this.CreateNewRecordStamps(tbl, ret);

        // include reference key if available
        col = tbl.ReferenceField;
        if (col) {
          console.log('\nGOT REFERENCE FIELD!');
          ret.stamps[col.name] = `{${col.format}}`;
        } else {
          console.log('\nNO REFERENCE FIELD!', tbl.columns);
        }
        //
      } else if (accessMode == 'edit') {
        // set updated date stamp
        col = tbl.UpdatedStampField;
        if (col)
          if (!ret.stamps[col.name])
            ret.stamps[col.name] = this.DataSet.dateStampString;
        // set updated by stamp
        col = tbl.UpdatedByStampField;
        if (col)
          if (!ret.stamps[col.name]) ret.stamps[col.name] = this.userInfo.name;
        // if (!ret.stamps[col.name]) ret.stamps[col.name] = this.userInfo.id;

        // Include key field in stamp with value = -1
        ret.stamps[tbl.keyName] = this.dataKeyValue;
      }

      if (accessMode) {
        // include revision key if available, when editing or adding new record
        col = tbl.RevisionField;
        if (col)
          ret.stamps[col.name] = accessMode == 'add' ? 0 : row[col.name] + 1;

        //
      }
      //
    } else if (subTable && accessMode == 'add') {
      // processing subTable with no change made and during
      // creation of new record in the main table
      this.CreateNewRecordStamps(tbl, ret);
    }

    return ret;
  }

  CreateNewRecordStamps(tbl: any, ret: any) {
    let col = tbl.CreatedStampField;
    if (col)
      if (!ret.stamps[col.name])
        ret.stamps[col.name] = this.DataSet.dateStampString;

    // set created by stamp
    col = tbl.CreatedByStampField;
    if (col)
      if (!ret.stamps[col.name]) ret.stamps[col.name] = this.userInfo.name;
    // if (col) if (!ret.stamps[col.name]) ret.stamps[col.name] = this.userInfo.id;

    // Include key field in stamp with value = -1
    ret.stamps[tbl.keyName] = -1;
  }

  get changed(): IDataChanged {

    return this.GetChanged(false);
  }
  get changedSub(): IDataChanged {
    return this.GetChanged(true);
  }

  EmptyObject(obj: any): boolean {
    if (!obj) return true;
    for (let key in obj) {
      return false;
    }
    return true;
  }

  get withChanges(): boolean {
    const changed: IDataChanged = this.changed;
    const changedSub: IDataChanged = this.changedSub;

    return !(
      this.EmptyObject(changed.data) && this.EmptyObject(changedSub.data)
    );
  }

  Save(): Observable<any> {
    // check changes
    // if no changes, promp user nothing to save
    this.DataSet.cl(['changed', this.changed]);

    if (!this.withChanges)
      // no changes found
      return this.OpenPrompt({
        form: this,
        title: this.prompts.saveNoChange.title,
        message: this.prompts.saveNoChange.message,
        icon: this.prompts.saveNoChange.icon,
        icon_color: this.prompts.saveNoChange.icon_color,
        buttons: this.prompts.saveNoChange.buttons,
        action: 'save_no_change',
      });

    // with changes... prompt user to confirm save

    return this.OpenPrompt({
      form: this,
      title: this.prompts.saveWithChange.title,
      message: this.prompts.saveWithChange.message,
      icon: this.prompts.saveWithChange.icon,
      icon_color: this.prompts.saveWithChange.icon_color,
      buttons: this.prompts.saveWithChange.buttons,
      action: 'save_with_change',
    });

    // if save, proceed. on error, prompt user, on success, prompt user

    // if not save, prompt user save aborted and continue editing
  }

  Reset(): Observable<any> {
    // check changes
    if (!this.withChanges)
      // if not changes, prompt user that no changes has been made so far
      return this.OpenPrompt({
        form: this,
        title: this.prompts.resetNoChange.title,
        message: this.prompts.resetNoChange.message,
        icon: this.prompts.resetNoChange.icon,
        icon_color: this.prompts.resetNoChange.icon_color,
        buttons: this.prompts.resetNoChange.buttons,
        action: 'reset_no_change',
      });

    // if changes were made, prompt user that original values will be restored
    //   and all changes made sore far will be lost
    return this.OpenPrompt({
      form: this,
      title: this.prompts.resetWithChange.title,
      message: this.prompts.resetWithChange.message,
      icon: this.prompts.resetWithChange.icon,
      icon_color: this.prompts.resetWithChange.icon_color,
      buttons: this.prompts.resetWithChange.buttons,
      action: 'reset_with_change',
    });
  }

  Cancel(): Observable<any> {
    const changed = this.changed;
    const changedSub = this.changedSub;

    if (this.withChanges)
      return this.OpenPrompt({
        form: this,
        title: this.prompts.cancelWithChange.title,
        message: this.prompts.cancelWithChange.message,
        icon: this.prompts.cancelWithChange.icon,
        icon_color: this.prompts.cancelWithChange.icon_color,
        buttons: this.prompts.cancelWithChange.buttons,
        action: 'cancel_with_change',
      });

    return null;
  }

  OpenPrompt(args: any): Observable<any> {
    const {
      title,
      buttons,
      icon,
      icon_color,
      width,
      height,
      disableClose,
      form,
      message,
      action,
    } = args;

    const ref = form.dialog.open(DetailsPopup, {
      minWidth: `${width ? width : 300}px`,
      maxWidth: '500px',
      minHeight: `${height ? height : 180}px`,
      disableClose: disableClose ? false : disableClose,
      data: {
        // data belonging to popup
        component: {
          component: PromptComponent,
          data: {
            message: message,
            icon: icon,
            icon_color: icon_color,
            action: action,
          },
        },
        title: title,
        buttons: buttons ? buttons : [],
        icon: icon,
        buttonClick: form.PromptButtonClick,
      },
    });

    console.log('File Uploader: ', this.fileUploader);

    return ref.afterClosed();
  }

  PromptButtonClick(e: { button: any; sender: any }) {
    if (!e) return;
    if (!e.sender) return;

    const ref = e.sender.dialogRef;
    const btn = e.button;
    const data = e.sender.data;

    const action = data.component.data.action;
    const ret: any = { value: btn.value, action: action };

    ref.close(ret); // returns control to the calling component
  }

  get PostData(): any {
    /**************************************************************************************
     * {
     *  <tableCode1>:Array<{record 1},...,{record #}>,
     *  [tableCode#]:Array<{record 1},...,{record #}>
     * }
     *
     * Note: Record must include key field value for the API to determine action. -1 means
     * record is to be created. value >=0 means record update is to be performed
     *
     * For new record with 'refrence' field type, an entry to the data record has to be
     * included and must be constructed out of ColumnInfo's format property
     *  Example:
     *    format: YY-NNNN
     *    value to use: {YY-NNNN|20}, where 20 is the year filter to use
     *                  in getting the next index number for NNNN
     *
     **************************************************************************************/
    return null;
  }

  PostUpdates(): Observable<any> {
    let e: any = { raw: {}, mode: this.AccessMode };
    if (this.beforePosting) {
      e.raw[this.TableCode] = this.changed;
      // console.log("\nPostUpdates this.TableCodeSub: ",this.TableCodeSub);
      if (this.TableCodeSub) {
        e.raw[this.TableCodeSub] = this.changedSub;
      }

      this.beforePosting.emit(e);
      console.log('@@@@ !Before Posting...', e);
    } else {
    }
    // setTimeout(() => {
    //   ref.close({ value: 'success', action: action });
    // }, 5000);
    return new Observable((obs) => {
      const isAdd = e.mode == 'add';
      const isEdit = e.mode == 'edit';
      const formData = { __config__: { useCommonNewKey: isAdd } };

      for (let tblKey in e.raw) {
        const data = e.raw[tblKey].data;

        // skip building data for table with no changed recorded when editing
        if (this.EmptyObject(data) && isEdit) continue;

        const row = {};
        const stamp = e.raw[tblKey].stamps;

        let links: any;
        let parentCode: string;
        let parentKeyName: string;
        let parentKeyValue: number;

        if (this.newId ? this.newId > 0 : false) {
          // include reserved table key value in the stamp collection
          //
          stamp[`__${this.sourceTable.keyName}__`] = this.newId;
          const gridObj = this.moduleExchangeInfo.gridObject;
          const detObj = this.moduleExchangeInfo.detailsObject;

          const parentGrid = gridObj.parentGrid;

          if (detObj.linkToParent && parentGrid) {
            const parentRow = parentGrid.grid.currentRow;
            const linkRow = {};

            const parentTable = parentRow.parentTable;
            parentKeyName = parentTable.keyName;
            parentCode = parentTable.tableCode;
            parentKeyValue = parentRow[parentKeyName];

            linkRow[parentKeyName] = parentKeyValue;
            linkRow['__links__'] = [
              {
                table_code: this.TableCode,
                child_ids: `${this.newId}`,
                action: 'add',
                simultaneous: true,
              },
            ];
            formData[parentCode] = [linkRow];
          }
        }

        // collect form field user-updated data
        for (let fldName in data) {
          row[fldName] = data[fldName];
        }

        // collect record stamp fields
        for (let fldName in stamp) {
          row[fldName] = stamp[fldName];
        }

        // assign row as tblKey property of formData
        formData[tblKey] = [row];
      }

      // create observable
      const postObs = this.DataSet.Post(formData);

      if (obs) {
        // send progress feedback to client
        this.ShowMask(
          this.AccessMode == 'edit'
            ? 'Saving changes. Please wait...'
            : 'Saving new record. Please wait...'
        );

        const subs = postObs.subscribe(
          (data) => {
            // subs.unsubscribe();

            obs.next(data);
            obs.complete();
          },
          (err) => {
            // subs.unsubscribe();
            // errorMessage = err.message;
            // this.dataSource.openSnackBar(eval(msgError), 'X', 5000);
            // // call onSuccess listener
            // if (onError) onError(err);
          },
          () => {

            this.HideMask();
            subs.unsubscribe();
          }
        );
      }
    });
  }

  private nfa = NodeFieldAliases;

  get ReqParams(): Array<RequestParams> {
    // get main table
    const tbl = this.DataSet.tables[this.TableCode];
    if (!tbl) return null;

    const params: Array<RequestParams> = [];

    const tblCfg: IRegularTableConfig = this.TableConfig;
    let keyField: string = tblCfg.keyField;
    if (!keyField) keyField = tbl.keyName;

    let param: RequestParams = new RequestParams({
      code: tbl.tableCode,
      fields: '*' + (tblCfg.extraFields ? '`' + tblCfg.extraFields : ''),
      snap: true,
    });

    const fldAsset: ColumnInfo = tbl.AssetField;

    let nodesTable: any = null;
    let treeTable: any = null;

    if (fldAsset) {
      // asset field needs to get code and description from the nodes table
      nodesTable = this.DataSet.NodesTable;
      const nodeCfg: ILookupTableConfig = nodesTable.TableLookupConfig;

      // asset field needs to get location from the nodes table
      const treCfg: ITreeTableConfig = this.DataSet.TreeTableConfig;

      param.code += `|-${nodesTable.tableCode},${fldAsset.name};-${treCfg.TreeTable.tableCode},${fldAsset.name},${treCfg.dataField};`;

      param.includedFields += `\`${nodeCfg.lookupCodeField}@${this.nfa.NODE_CODE}\`${nodeCfg.lookupTextField}@${this.nfa.NODE_TEXT}\`${treCfg.locationField}@${this.nfa.NODE_LOCATION}`;

      param.filter = `{${treCfg.groupField}|eq|${this.DataSet.currentTreeId}}`;
    }

    if (tblCfg.extraJoins) param.code += tblCfg.extraJoins;
    if (!param.filter) param.filter = '';

    param.filter +=
      (param.filter ? '^' : '') +
      `{${tblCfg.keyField}|eq|${this.dataKeyValue}}`;

    params.push(param);

    if (this.AccessMode == 'edit')
      params.push(this.DataSet.GetLockParams(tbl.tableCode, this.dataKeyValue));

    // create sub table parameters if defined in the configuratino file
    const subTable: any = tblCfg.subTable;
    const subTableItem: any = subTable ? subTable[this.recordType] : '';
    const subTableCode: string =
      subTableItem == undefined ? '' : subTableItem.tableCode;
    const subExtraJoins: string =
      subTableItem == undefined ? '' : subTableItem.extraJoins;
    const subExtraFields: string =
      subTableItem == undefined ? '' : subTableItem.extraFields;

    this.TableCodeSub = '';

    if (subTableCode) {
      this.TableCodeSub = subTableCode;
      const tblSub = this.DataSet.tables[subTableCode];
      if (tblSub) {
        const tblCfgSub: IRegularTableConfig = tblSub.TableConfig;
        if (tblCfgSub) {
          console.log(
            `\nFormA ReqParams called from Requery ...TableCode: ${this.TableCode}, subTableItem: ${subTableItem}, subTableCode: ${subTableCode}, subExtraJoins: ${subExtraJoins}, subExtraFields: ${subExtraFields}`
          );

          param = new RequestParams({
            code: subTableCode,
            fields: '*' + (subExtraFields ? '`' + subExtraFields : ''),
            snap: true,
          });
          if (subExtraJoins) param.code += subExtraJoins;
          param.filter = `{${tblCfgSub.keyField}|eq|${this.dataKeyValue}}`;

          console.log('\nSubTableParam: ', param);
          params.push(param);
        }
      }
    }

    // console.log(
    //   '\nReqParams MainTable: ',
    //   tbl,
    //   '\nParam: ',
    //   param,
    //   '\nParams:',
    //   params,
    //   '\ndataKeyValue:',
    //   this.dataKeyValue,
    //   "\nFormObject:",this.formObject,
    //   "\nFormObjectSub:",this.formObjectSub,
    //   "\nSourceTable:",this.sourceTable,
    //   "\nFormRow:",this.formRow,
    // );

    return params;
  }

  ClearForm() {
    if (this.formObject) {
      for (const field in this.formObject.controls) {
        // 'field' is a string
        const control = this.formObject.get(field); // 'control' is a FormControl

        control.setValue(null);
      }
      this.formRow = null;
      if (this.formObjectSub) {
        for (const field in this.formObjectSub.controls) {
          // 'field' is a string
          const control = this.formObject.get(field); // 'control' is a FormControl
          if (control) control.setValue(null);
        }
        this.formRowSub = null;
      }
    }
  }

  OnRecordTypeChanged(): void {
    // this event must trigger first before requery executes...
    const tbl = this.DataSet.tables[this.TableCode];
    const recordTypeOptions: Array<any> = tbl.recordTypeOptions;
    //this.SetupSources();
    // console.log(
    //   '\nFormA: OnRecordTypeChanged: ',
    //   this._recordType,
    //   recordTypeOptions
    // );
    if (recordTypeOptions) {
      const opt = recordTypeOptions.find((o) => o.key == this._recordType);
      this.TableCodeSub = opt ? opt.tableCode : null;
    } else {
      this.TableCodeSub = null;
    }
  }

  Requery(args?: { onSuccess?: Function; onError?: Function }) {
    // timeout is required to allow setting of required propeties
    // first before invoking data extraction...
    setTimeout(() => {
      this.ExecuteRequery(args);
    });
  }

  get urlNewInfo(): string {
    return this.DataSet.urlBase + '/app/newinfo';
  }

  private _newId = -1;
  get newId(): number {
    return this._newId;
  }

  get parentId(): number {
    if (this.moduleExchangeInfo.detailsObject) {
      return this.moduleExchangeInfo.detailsObject.parentKeyValue;
    } else {
      return undefined;
    }
  }

  ExecuteRequery(args?: { onSuccess?: Function; onError?: Function }) {
    // initiate request to API
    /// check required objects if available

    if (this.destroyed) { console.log("##### DESTROYED! ", this.destroyed); return; }
    if (!this.DataSet) { console.log("##### NO DATASET! "); return; }
    if (!this.TableCode) { console.log("##### NO TABLE CODE! "); return; }

    this.isLoadingDetail = true;

    if (this.AccessMode == 'add') {
      // creating new record
      this.formRow = this.sourceTable.NewRow();
      this.formRow[this.sourceTable.keyName] = -1;
      // this.formObject.patchValue(this.formRow);

      if (this.TableCodeSub) {
        this.formRowSub = this.sourceTable.NewRow();
        this.formRowSub[this.sourceTableSub.keyName] = -1;
        // this.formObjectSub.patchValue(this.formRowSub);
      }

      // get new id here... temporary method of assigning new id as of 2021/02/15

      const http = this.DataSet.http;
      const fd = new FormData();
      fd.append('code', this.TableCode);

      const obs = http.post(this.urlNewInfo, fd, {
        reportProgress: true,
        observe: 'events',
      });

      const subs = obs.subscribe(
        (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log(
              `Progress: ${Math.round((10000 * event.loaded) / event.total) / 100
              }`
            );
          } else if (event.type === HttpEventType.Response) {
            //const {FileInfos,status} = event.body;
            const body: any = event.body;
            const { tableCode, newId, message, status } = body;

            if (status == 'success') {
              this._newId = newId;

              console.log(
                'New ID: ',
                this.newId,
                ', ParentKeyValue: ',
                this.parentId
              );
            } else if (status == 'error') {
              // prompt user and stop uploading
              console.log('Error getting new record information: ', message);
            }
          }
        },
        (err) => {
          console.log('Error: ', err);
        },
        () => {
          // console.log('Complete checking: ', fileToProcess);
          subs.unsubscribe();
          // hide all user feedback
          this._isLoadingDetail = false;
        }
      );

      // hide all user feedback
      // this._isLoadingDetail = false;

      return; // return to prevent subsequent codes for edit mode to be executed
    }

    const reqParams = this.ReqParams;

    if (args == undefined) args = {};
    const { onSuccess, onError } = args;

    this._isLoadingDetail = true;

    const subs = this.DataSet.Get(reqParams, {
      onSuccess: (data) => {
        this.ProcessData(data);

        if (onSuccess) onSuccess(this);
        this._isLoadingDetail = false;
        subs.unsubscribe();
      },
      onError: (err) => {
        console.log('\nError Data: ', err);
        this.formRow = null;

        if (onError) onError(err);
        this._isLoadingDetail = false;
        subs.unsubscribe();
      },
    });

    return;

    // const params: Array<RequestParams> = [];

    // let tableFrom: string =
    //   this.TableCode + (this._JoinExpression ? '|' + this._JoinExpression : '');

    // let filter: string = `{${this.sourceTable.keyName}|${this.dataKeyValue}}`;
    // let extra: string = this.Extra ? '*`' + this.Extra : undefined;

    // const tbl = this.sourceTable;
    // const assetCol: ColumnInfo = tbl.AssetField;
    // if (assetCol) {
    //   // add inner join to DataSet.tblTreeStruc
    //   // add filter to tree type

    //   if (tableFrom.indexOf('-tre') == -1) {
    //     tableFrom +=
    //       (tableFrom.endsWith(';')
    //         ? ''
    //         : tableFrom.indexOf('|') == -1
    //         ? '|'
    //         : ';') + `-tre,${assetCol.name},TRE_DAT_TAG`;
    //   }
    //   filter += `^({TRE_DAT_TYPE|${this.DataSet.currentTreeId}})`;
    //   if (!extra) extra = '';
    //   extra += (extra.length ? '`' : '') + 'TRE_NOD_LOC';
    // }

    // params.push(
    //   new RequestParams({
    //     code: tableFrom,
    //     filter: filter,
    //     fields: extra,
    //     snap: true,
    //   })
    // );

    // console.log('\nRequeryParams: ', params);

    // if (this.TableCodeSub) {
    //   console.log(
    //     '\nForm this.TableCodeSub: ',
    //     this.TableCodeSub,
    //     this.TableCodeSub == null,
    //     typeof this.TableCodeSub
    //   );
    //   params.push(
    //     new RequestParams({
    //       code:
    //         this.TableCodeSub +
    //         (this._JoinExpressionSub ? '|' + this._JoinExpressionSub : ''),
    //       filter: `{${this.sourceTableSub.keyName}|${this.dataKeyValue}}`,
    //       fields: this.ExtraSub ? '*`' + this.ExtraSub : undefined,
    //       snap: true,
    //     })
    //   );
    // }

    // let opt: DataGridOption = new DataGridOption([]);
    // const gcols = tbl.clientConfig.gridColumns;
    // gcols.forEach((col) => {
    //   const colArr = (col + '|').split('|');
    //   const field = colArr[0];
    //   const propArr = colArr[1].split(';');
    //   const noFilter = propArr.indexOf('nofilter') != -1;
    //   const center = propArr.indexOf('center') != -1;
    //   const right = propArr.indexOf('right') != -1;
    //   const left = propArr.indexOf('left') != -1 || (!center && !right);

    //   const cap = this.GetProperty(propArr, 'cap');
    //   const width = this.GetProperty(propArr, 'wd');
    //   const minWidth = this.GetProperty(propArr, 'mnw');
    //   const maxWidth = this.GetProperty(propArr, 'mxw');

    //   const colInfo: ColumnInfo = tbl.columns.find((c) => c.name == field);
    //   if (colInfo.isAssetField) {
    //     const tblTree = this.DataSet.TreeTable;
    //     const tblAsset = this.DataSet.NodesTable;
    //     // console.log("\nSpecialTables: ",tblTree,tblAsset)
    //   }

    //   // console.log(
    //   //   '\nGridCol: ',
    //   //   field,
    //   //   noFilter,
    //   //   center,
    //   //   right,
    //   //   left,
    //   //   cap,
    //   //   width,
    //   //   minWidth,
    //   //   maxWidth,
    //   //   // colInfo
    //   // );
    // }); // data grid fields iteration...

    // console.log(
    //   '\nfromClauseCode:',
    //   opt.fromClauseCode,
    //   '\nFields:',
    //   opt.FieldList
    // );
    // /**
    //  *
    //  */
    // if (args == undefined) args = {};
    // const { onSuccess, onError } = args;

    // this.DataSet.Get(params, {
    //   onSuccess: (data) => {
    //     console.log('\nRequeryData: ', data);
    //     this.listRequery = false;
    //     this.formRow = data.processed.data[0][0];
    //     if (this.formRow) {
    //       this.formObject.patchValue(this.formRow);
    //       this.CheckExtra(this.formObject, this.Extra, this.formRow);
    //     } else {
    //     }

    //     if (data.processed.data.length == 2) {
    //       this.formRowSub = data.processed.data[1][0];

    //       // the following code will fail if sub record was not created on initial
    //       // creation of the main record
    //       if (this.formRowSub) {
    //         this.formObjectSub.patchValue(this.formRowSub);
    //         this.CheckExtra(this.formObjectSub, this.ExtraSub, this.formRowSub);
    //       }
    //     }

    //     if (onSuccess) onSuccess(this);

    //     this._isLoadingDetail = false;
    //   },
    //   onError: (err) => {
    //     this.formRow = null;
    //     if (onError) onError(err);
    //   },
    // });
  }

  GetProperty(propsArr: Array<string>, propName: string): string {
    const propKey = propName + '=';
    const prop = propsArr.find((p) => p.substr(0, propKey.length) == propKey);
    return prop ? prop.substr(propKey.length) : '';
  }

  GetRowByTableCode(data: Array<any>, tableCode: string): any {
    let ret: any = null;
    data.forEach((dat) => {
      if (ret) return;
      if (dat.length) {
        const row = dat[0];
        const tbl = row.parentTable;
        if (tbl.tableCode == tableCode) ret = row;
      }
    });
    return ret;
  }

  ProcessData(data: any): void {
    if (!data) return;

    const allData = data.processed.data;

    // get main table row
    this.formRow = this.GetRowByTableCode(allData, this.TableCode);

    // console.log(
    //   '##### ProcessData tbl:',
    //   this.TableCode,
    //   'sub: ',
    //   this.TableCodeSub,
    //   ', data: ',
    //   data
    // );

    this.formRowSub = null;
    this.formLock = null;
    this.sourceTableSub = null;
    this.formObjectSub = null;

    if (this.formRow) {
      this.formObject.patchValue(this.formRow);
      this.CheckExtra(this.formObject, this.sourceTable, this.formRow);

      if (this.TableCodeSub) {
        this.formRow = this.GetRowByTableCode(allData, this.TableCodeSub);
      }

      if (this.AccessMode && this.AccessMode != 'view' && !this.destroyed) {
        this.formLock = this.GetRowByTableCode(allData, 'lk');

        if (!this.formLock) {
          // record is not locked by other user, set record lock now

          this.DataSet.LockRecord(
            this.TableCode,
            this.formRow[this.formRow.parentTable.keyName],
            (data) => {
              const lkRec = data.find((lk) => lk.returnCode == 'lk');
              if (lkRec) {
                const returnDataParams = lkRec.returnDataParams;
                this._lockId = returnDataParams.newKey;

              }
            }
          );
        } else {
          console.log(
            'Not lockable: ',
            this.formLock,
            this.formLock.LOCK_ID,
            this.userInfo
          );
          if (!this.locked) this._lockId = this.formLock.LOCK_ID;
        }
      }
    } // if main table row is found

    if (this.formRowSub) {
      const tbl = this.formRowSub.parentTable;
      this.sourceTableSub = this.formRowSub.parentTable;

      this.formObjectSub = this.sourceTableSub.GetDataForm(
        this.formRowSub ? this.formRowSub : undefined
      );
    }

  }

  ScatterData() { }
  ScatterDataSub() { }

  SetupSources() {
    if (this.DataSet) {
      if (this.TableCode) {
        this.sourceTable = this.DataSet.tables[this.TableCode];
        // this.sourceTable.AssignStamps();
      }

      if (this.TableCodeSub) {
        this.sourceTableSub = this.DataSet.tables[this.TableCodeSub];
        // this.sourceTableSub.AssignStamps();
      }
    }
  }

  private _formFields: {};
  public get formFields(): {} {
    return this._formFields;
  }

  private _RegInput: any = {};
  public RegInput(input: AppInputAComponent) {
    if (!this._RegInput[input.fieldName]) {
      this._RegInput[input.fieldName] = input;
    }
  }

  public RegisterField(fieldName: string): FormControl {
    if (!this.formObject) return null;

    let control: any = this.formObject.get(fieldName);

    if (!control) {
      // if control is not yet part of the form
      const colVal = this.sourceRow ? this.sourceRow[fieldName] : null;

      // register field as with initialized value when sourceRow is available
      // this is a must to prevent reinitialization when Scatter method is called
      if (this.sourceRow) this.MarkAsInitialized(fieldName);

      control = new FormControl(colVal);
      this.formObject.addControl(fieldName, control);
    } else {
      // control has previously been created
      this.MarkAsInitialized(fieldName);
    }
    return control;
  }

  public MarkAsNotInitialized(fieldName: string) {
    const index = this.fieldsInitialized.indexOf(fieldName);
    if (index != -1) this.fieldsInitialized.splice(index, 1);
  }
  public MarkAsInitialized(fieldName: string) {
    const index = this.fieldsInitialized.indexOf(fieldName);
    if (index == -1) this.fieldsInitialized.push(fieldName);
  }

  public Scatter(recordChanged?: boolean): void {
    // 20201125 made this to bypass old scatter routine when table code is avaialble
    if (this.TableCode) return;

    /******************************************************************************
     * Sets the values of form controls to the equivalent field of the source
     ******************************************************************************/
    if (!this.formObject) return;

    if (recordChanged == undefined) recordChanged = false;
    if (recordChanged) this.fieldsInitialized = [];

    let patchValues: any = {};
    let sourceTable: any = null;
    let cols: Array<any> = [];
    let ctrl: AbstractControl;

    this.suspendControlChangeEvent = true; // suspend control change event

    if (this.sourceRow) {
      // sourceTable = this.sourceRow.parentTable;
      // if (sourceTable) cols = sourceTable.columns;

      for (const field in this.formObject.controls) {
        // 'field' is a string
        // patch value of each

        // if control is not to be updated, continue with the next control
        if (this.excludes.indexOf(field) != -1) continue;

        // check if the field value has already been set initially
        if (this.fieldsInitialized.indexOf(field) != -1) continue;

        let controlEnabled: boolean = true;
        let colValue: any = undefined;

        ctrl = this.formObject.get(field);

        if (ctrl) {
          // field is not yet initialized

          // get field value from the source row
          colValue = this.sourceRow[field];

          //if (colValue == 'TBA' || colValue == undefined)
          // if (colValue == 'TBA') controlEnabled = false;

          patchValues[field] = colValue;

          // field is now initialized
          // this.formFields[field] = true;

          // register field as with value initially set
          this.fieldsInitialized.push(field);

          if (controlEnabled) {
            if (ctrl.disabled) ctrl.enable();
          } else {
            if (!ctrl.disabled) ctrl.disable();
          }
        }
      } // end of for
    } // end of sourceRow available

    // sourceRow is not set or null
    else
      for (const field in this.formObject.controls) {
        // 'field' is a string
        // patch value of each
        ctrl = this.formObject.get(field);
        if (ctrl) {
          // next line causes error reported on browser debugger but does not affect
          // execution of the program.
          if (!ctrl.disabled) ctrl.disable();
          patchValues[field] = null;
        }
      }

    // apply changed values to form object
    this.formObject.patchValue(patchValues);

    // resume control change event
    this.suspendControlChangeEvent = false;

    this.afterScatter.emit(this);
  }

  ChangeAsset(e: AppInputAComponent) {
    const form = e.formObject;
    const row = e.form.formRow;
    const col: ColumnInfo = e.columnInfo;
    const currAsset = form.get(e.fieldName).value;
    // const currLocation = row.XTRA[col.props.nodeloc];
    const currLocation = form.get(this.nfa.NODE_LOCATION).value;

    const subs = e.form.SelectLocation(currLocation).subscribe(
      (data) => {
        if (data.button.value == 'accept') {
          // change location now
          const node: TreeViewNode =
            data.sender.data.component.data.treeView.currNode;
          console.log('\nChangeLocation:', data, node);

          // assign new values for form data
          if (!this.listRequery) this.listRequery = currAsset != node.did;

          // recolor tree when asset is changed
          if (!this.treeColorReset && currAsset != node.did)
            this.treeColorReset = true;

          if (this.listRequery) {
            // trigger list requery
            // row.XTRA[col.props.nodeloc] = node.loc; // set node tree location
            form.get(this.nfa.NODE_LOCATION).setValue(node.loc); // set node tree location
            form.get(e.fieldName).setValue(node.did); // set data id
            form.get(this.nfa.NODE_TEXT).setValue(node.text); // set field display
            // form.get(col.props.display).setValue(node.text); // set field display
          }
        }
      },
      (err) => { },
      () => {
        subs.unsubscribe();
      }
    );
  }

  SelectLocation(currentLocation?: string): Observable<any> {
    const ref = this.dialog.open(DetailsPopup, {
      minWidth: `${350}px`,
      maxWidth: `${550}px`,
      minHeight: `${550}px`,
      maxHeight: `${650}px`,
      disableClose: false,
      data: {
        // data belonging to popup
        component: {
          component: LocationSelectorComponent,
          data: {
            dataSet: this.DataSet,
            treeLoadingMessage: 'Loading locations. Please wait...',
            currentLocation: currentLocation,
          },
        },
        title: 'Select Asset',
        buttons: this.DataSet.btnCancelAccept,
        icon: 'fa fa-sitemap',
        buttonClick: this.AssetSelectButtonClick,
      },
    });

    return ref.afterClosed();
  }
  AssetSelectButtonClick(e: { button: any; sender: any }) {
    // console.log('AssetSelectButtonClick:', e);
    const ref = e.sender.dialogRef;
    ref.close(e);
  }

  ShowMask(message?: string) {
    this.HideMask();
    if (message) this.maskMessage = message;
    setTimeout(() => (this.isLoadingDetail = true));
  }
  HideMask(): void {

    if (!this.isLoadingDetail) return;
    setTimeout(() => {
      this.isLoadingDetail = false;
      this.maskMessage = 'Loading. Please wait...';
    }
    )
  }

  get ProgressDisplaySingle(): string {
    if (this.progress == undefined) return undefined;
    return `${this.progress}%`;
  }
}
