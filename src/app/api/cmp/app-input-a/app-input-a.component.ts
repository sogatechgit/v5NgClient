import { FileUploaderComponent } from './../file-uploader/file-uploader.component';
import { ColumnInfo } from './../../mod/app-column.model';
import { NodeFieldAliases } from './../../mod/app-params.model';
import * as moment from 'moment/moment';
import { PanelAComponent } from './../panel-a/panel-a.component';
import { AppFormAComponent } from './../app-form-a/app-form-a.component';
import {
  Component,
  OnInit,
  Input,
  Inject,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
  ɵConsole,
} from '@angular/core';
import { FormGroup, Validators , AbstractControl } from '@angular/forms';
import {
  ILookupMapInfo,
  ILookupTableParams,
} from '../../mod/app-common.classes';

@Component({
  selector: 'app-app-input-a',
  templateUrl: './app-input-a.component.html',
  styleUrls: ['./app-input-a.component.scss'],
})
export class AppInputAComponent implements OnInit, AfterViewInit {
  @ViewChild('input') _input: ElementRef;
  input: HTMLElement;

  @ViewChild('picker') picker: any;

  @Input() type: string = null;

  @Input() multiSelectFile: boolean;

  @Input() noRegister: boolean = false;

  @Input() label: string = '';
  @Input() height: number = -1;
  @Input() width: number = -1;

  @Input() labelWidth: number = -1;
  @Input() rows: number = -1;

  @Input() phBackSize: number = -1;
  @Input() phDuration: number = -1;

  @Input() dateFormat: string = 'DD-MMM-YYYY';
  @Input() dateTimeFormat: string = 'DD-MMM-YYYY, hh:mm:ss a';

  @Input() fieldName: string = 'TBA';

  @Input() actionIcon: string = '';
  @Input() actionTip: string = null;

  @Input() BgColor: boolean = false;

  @Output() actionClick: EventEmitter<any> = new EventEmitter();
  @Output() valueChanged: EventEmitter<any> = new EventEmitter();
  @Output() fileSelected: EventEmitter<any> = new EventEmitter();

  @Input() placeHolder: string = '';

  @Input() LPL: number = -1;
  @Input() LPR: number = -1;

  @Input() toggleDisplay: Array<any> = null;
  @Input() radioData: Array<any> = null;

  // expects {key1,value2,key2,value2,..,..,key#,value#},
  // where key# is the actual value of the field and value is the display text
  // used as option text or input text
  @Input() lookupSource: any = null;

  @Input() lookupTable: any = null;
  //144
  @Input() lookupGroupField: string = null;

  private _lookupTableCode: string;
  public useLookupText: boolean = false;
  @Input() set lookupTableCode(value: string) {
    this._lookupTableCode = value;
  }
  get lookupTableCode(): string {
    if (this._lookupTableCode == undefined) {
      this._lookupTableCode = null;
      const col = this.columnInfo;
      if (col) {
        if (col.props.lookuptable) {
          this.lookupTableCode = col.props.lookuptable;
          if (col.props.useLookupText) this.useLookupText = true;
          //useLookupText
        }
      }
    }

    return this._lookupTableCode;
  }

  /**
   *      if (this.fieldName == 'AI_ACT_PARTY1') {
        console.log(`\n${this.fieldName} lookup (lookupKey, lkpMap)...`,this.formObject,this.lookupTableCode );
      }
   */

  @Input() lookupValue: string = null;
  @Input() lookupDisplay: string = null;

  private _lookupGroup: number = null;
  @Input() set lookupGroup(value: number) {
    this._lookupGroup = value;
  }
  private _lookupGroupCol: ColumnInfo;
  get lookupGroup(): number {
    if (this._lookupGroupCol == undefined && !this._lookupGroup) {
      // [lookupGroup]="146"
      this._lookupGroupCol = this.columnInfo;

      if (!this._lookupGroupCol) {
        // just making sure that the columndef object is null when not defined
        this._lookupGroupCol = null;
      } else {
        if (this._lookupGroupCol.props.lookupgroup)
          this._lookupGroup = this._lookupGroupCol.props.lookupgroup;
      }
    }
    return this._lookupGroup;
  }

  @Input() readOnly: boolean;

  public get phBackSizeSelf(): number {
    if (this.phBackSize != -1) return this.phBackSize;
    if (this.form.phBackSize != -1) return this.form.phBackSize;
    return 400; // default if at neither at form level nor input level is set
  }
  public get phDurationSelf(): number {
    if (this.phDuration != -1) return this.phDuration;
    if (this.form.phDuration != -1) return this.form.phDuration;
    return 4; // default if at neither at form level nor input level is set
  }

  public get lookupItem():any{
    const lkpDef = this.fieldLookupDef;
    const val = this.value;
    if(!lkpDef || !val) return null;

    return lkpDef.find(i=>i.key == val);
  }


  public get value(): any {
    if (!this.formObject) return null;
    const ctrl = this.formObject.get(this.fieldName);
    return ctrl ? ctrl.value : null;
  }

  public set value(value: any) {
    if (!this.formObject) return;
    const ctrl = this.formObject.get(this.fieldName);
    if (ctrl) ctrl.setValue(value);
  }

  private fieldLookupProcessed: boolean = false;
  private fieldLookupRequested: boolean = false;

  private _filterValueOldKey: string;
  private _filterValue: number;
  private _fieldLookupDef: any = null;
  private _fieldLookupDefExtracted: boolean = false;
  private _fieldLookupExtractng: boolean = false;

  public get fieldLookupDef(): any {
    // intercept fieldLookup return value
    // if lookup definition is derived from
    // the table column's configuration

    let isCommonLookup: boolean = this.lookupGroup
      ? !isNaN(+this.lookupGroup)
      : false;

    let lookupKey: string;
    let lkpDef: ILookupTableParams;
    let lkpTable: any;
    let lkpMap: ILookupMapInfo;
    const col: ColumnInfo = this.columnInfo;

    if (isCommonLookup) {
      lookupKey = this.lookupGroup + '';
    } else if (this.lookupTableCode) {
      lkpTable = this.form.DataSet.tables[this.lookupTableCode];

      if (!lkpTable) return null;
      lkpDef = lkpTable.lookupDef;

      if (lkpDef) {
        // if lookupGroupField is not defined in the template, get definition in lkpDef object
        //if (!this.lookupGroupField) this.lookupGroupField = lkpDef.groupField;
        lkpMap = lkpDef.mapInfo; // get map information value
      }

      if (this.lookupGroupField) {
        // lookupGroupField is available, get value of the groupfield from thee formObject
        // and make use of it as filterValue and as part of the lookup key
        const grpCtrl = this.formObject.get(this.lookupGroupField);
        if (grpCtrl)
          if (grpCtrl.value) {
            this._filterValue = grpCtrl.value;
            lookupKey = this.lookupTableCode + '_' + this._filterValue;
          }
      } else {
        lookupKey = this.lookupTableCode;
      }
    } else if (col) {
      if (this.fieldName == 'AI_ACT_PARTY1') {
        // console.log('\nActionParty 1 lookup (col)...', col);
      }
    }

    // if lookup key is not available it means that the field is no a select type
    if (!lookupKey) return null;
    if (!this.form.DataSet) return null;

    if (this._fieldLookupDef) {
      if (isCommonLookup) return this._fieldLookupDef;
      else if (this.lookupGroupField) {
        if (!this.form.DataSet) return null;

        // return the same lookup object if ket was not changed
        if (this._filterValueOldKey == lookupKey) return this._fieldLookupDef;

        // else reses lookup object and set extracted flag to false
        this._fieldLookupDef = null;
        this._fieldLookupDefExtracted = false;
        this._filterValueOldKey = lookupKey;
        return null;
      } else {
        return this._fieldLookupDef;
      }
    }

    // if (this._fieldLookupDefExtracted) return null;

    const lkp = this.form.DataSet.GetLookupItems(lookupKey, lkpMap);
    // if lookup raw records were already extracted previously
    if (lkp.length) {
      this._fieldLookupDef = lkp;
      this._fieldLookupDefExtracted = true;
      return this._fieldLookupDef;
    }

    if (!this._fieldLookupDefExtracted) {
      this._fieldLookupDefExtracted = true;

      let parms: any = null;

      if (this.lookupTableCode) {
        parms = { tableCode: this.lookupTableCode };
        if (this.lookupGroupField) {
          parms.filterField = this.lookupGroupField;
          parms.filterValue = this._filterValue;
        }
        this._filterValueOldKey = lookupKey;
      } else if (this.lookupGroup) {
        parms = { filterValue: this.lookupGroup };
      }

      // if lookup parameter is supplied and raw lookup
      // records are not yet extracted
      if (parms) {
        this._fieldLookupExtractng = true; // use th
        this.form.DataSet.SetLookupData([parms], (data) => {
          // insert routine after requesting lookup records
          this._fieldLookupExtractng = false;
        });
      }
    }

    return null;
  }

  public get fieldLookup(): any {
    if (this.lookupSource) return this.lookupSource;

    // this is to bypass old fieldLookup codes whem fieldLookupDef is populated
    if (this.fieldLookupDef) return this.fieldLookupDef;

    // old fieldLookup codes STARTS HERE! 2020/12/09
    const tbl = this.lookupTable;

    if (!tbl && !this.lookupGroup && !this.lookupValue && !this.lookupDisplay)
      return null;

    if (tbl && !this.fieldLookupProcessed) {
      if (!this.fieldLookupProcessed) {
        let rows: Array<any> = [];
        if (!this.fieldLookupRequested) {
          if (this.lookupGroup) {
            rows = tbl.GetRowsByGroup({
              key: this.lookupGroup,
              onSuccess: (e) => {
                rows = e.processed.data;
              },
            });
          } else {
            rows = tbl.GetRows();
            if (rows.length == 0) {
              tbl.Get({
                code: tbl.tableCode,
                includedFields: this.lookupValue + '`' + this.lookupDisplay,
                onSuccess: (e) => {
                  rows = e.processed.data;
                },
              });
            } else {
              //
            }
          }
        }
        if (rows.length != 0) {
          this.lookupSource = [];
          rows.forEach((r) => {
            this.lookupSource.push({
              key: r[this.lookupValue],
              text: r[this.lookupDisplay],
            });
          });
          this.fieldLookupProcessed = true;
        }
      }
    }
    return this.fieldLookupProcessed && this.lookupSource
      ? this.lookupSource
      : [];
  }

  get LabelWidth(): number {
    if (this.labelWidth != -1) return this.labelWidth;
    //return this.panel.labelWidth;
    return this.panel.LabelWidth;
  }
  get labelPaddingLeft(): number {
    if (this.LPL != -1) return this.LPL;
    if (this.panel.LPL != -1) return this.panel.LPL;
    return 0;
  }

  get labelPaddingRight(): number {
    if (this.LPR != -1) return this.LPR;
    if (this.panel.LPR != -1) return this.panel.LPR;
    return 0;
  }

  constructor(
    @Inject(AppFormAComponent) public form: AppFormAComponent,
    // @Inject(WrapperAComponent) public wrapper: WrapperAComponent,
    @Inject(PanelAComponent) public panel: PanelAComponent
  ) {}

  private _isReady: boolean = false;
  private _changeValueNow: boolean = false;

  // get form():AppFormAComponent{

  //   return this.panel.form;
  // }
  ngOnInit(): void {
    const lkpGrp = this.lookupGroup; // just to trigger ColumnInfo props lookup

    if (!this.fieldName || !this.formObject) return;

    if (!this.noRegister) this.form.RegisterField(this.fieldName);

    if (!this.lookupTableCode) {
      const col = this.columnInfo;
      if (col) {
        // lookup table code is not defined at design time,
        // try to check if it's defined in column definition
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => (this._changeValueNow = true), 0);
    setTimeout(() => {
      this._isReady = true;
      //
      const col: ColumnInfo = this.columnInfo;
      if (!this.toggleDisplay && (col ? col.lookupSwitch : false))
        this.toggleDisplay = col.lookupSwitch;
      //
    }, 0);
    // setTimeout(() => (this._isReady = true), 2000);

    if (this.form) {
      this.form.RegInput(this);
    }
  }

  public get formObject(): FormGroup {
    return this.panel.formObject;
  }

  private _formControlNameFinal: string;
  public get formControlNameFinal(): string {
    if (this._formControlNameFinal == undefined) {
      const col = this.columnInfo;
      if (col) {
        if (col.props.display) {
          // display field is found...
          // check if control is available in the form
          const dispCtrl = this.formObject.get(col.props.display);
          if (dispCtrl) {
            this._formControlNameFinal = col.props.display;
            // return this._formControlNameFinal;
          }
        } else if (col.isAssetField) {
          this._formControlNameFinal = this.nfa.NODE_TEXT;
          // return this._formControlNameFinal;
        }
      }
      if (!this._formControlNameFinal) {
        const ctrl = this.formObject.get(this.fieldName);
        this._formControlNameFinal = ctrl ? this.fieldName : 'UNKNOWN';
      }
    }

    // if(this.fieldName== 'AN_TYPE') {
    //   // if(this.fieldName== 'ANTYPE_GROUP') {
    //   console.log('\nthis._formControlNameFinal ANTYPE_GROUP: ',this._formControlNameFinal)
    // }
    return this._formControlNameFinal;
  }

  public nfa = NodeFieldAliases;

  public get sourceRow(): any {
    return this.panel.sourceRow;
  }
  public get sourceTable(): any {
    return this.panel.sourceTable;
  }

  public get background(): string {
    let DisVal: string = this.displayValue;//20210309 Neo Added for optional background coloring of input.
    if (!this._changeValueNow) return null;
    if (this.isDisabled) return null;
    if (this.BgColor) return  DisVal==undefined ? 'white' : DisVal;
    return 'white';
  }

  public get isDisabled(): boolean {
    if (!this.formObject) return true;
    const ctrl = this.formObject.get(this.fieldName);
    if (!ctrl) return true;
    return ctrl.disabled;
  }

  public get isReadOnly(): boolean {
    if (this.readOnly != undefined) return this.readOnly;
    if (this.panel.readOnly != undefined) return this.panel.readOnly;
    if (this.form.readOnly != undefined) return this.form.readOnly;
    return false;
  }

  public get controlHeight(): number {
    if (this.height != -1) return this.height;
    return this.form.controlHeight;
  }

  public get inputWidth(): number {
    let ret: number = null;
    if (this.width != -1) ret = this.width;
    if (this.panel.inputWidth != -1) ret = this.panel.inputWidth;
    if (ret != null && this.actionIcon) {
      // ret -= 25;
    }
    return ret;
  }

  public get Rows(): number {
    // number of text rows the input control will display
    if (this.rows != -1) return this.rows;
    return 1;
  }

  public get isInput(): boolean {
    if (!this.fieldName) return false;
    return (
      this.Rows == 1 &&
      !this.isSelect &&
      !this.isToggle &&
      !this.isCheck &&
      !this.isRadio &&
      !this.isDate
    );
  }

  public get isSelect(): boolean {
    if (!this.fieldName) return false;
    return this.Rows == 1 && this.fieldLookup;
  }

  public get isMemo(): boolean {
    if (!this.fieldName) return false;
    return this.Rows != 1 && !this.fieldLookup;
  }

  public get isToggle(): boolean {
    if (!this.toggleDisplay) return false;
    const tLen = this.toggleDisplay.length;
    return tLen == 2 || tLen == 3;
  }

  public selectColor(value?: number): { fore: string; back: string } {
    let ret: any = { fore: null, back: null };
    if (!this.lookupSource) return ret;
    if (this.lookupSource.length == 0) return ret;

    const lkpValue = value == undefined ? this.getFormControl.value : value;
    if (!lkpValue) return ret;

    const lkp = this.lookupSource.find((e) => e.key == lkpValue);
    if (lkp) ret = { fore: lkp.fore, back: lkp.back };

    return ret;
  }

  public get isCheck(): boolean {
    if (!this.toggleDisplay) return false;
    return this.toggleDisplay.length == 0;
  }

  public get isRadio(): boolean {
    if (!this.radioData) return false;
    if (this.radioData.length < 2) return false;
    return true;
  }

  public get columnInfo(): ColumnInfo {
    let tbl = this.sourceTable;

    if (!tbl) {
      const row = this.sourceRow;
      if (!row) return null;

      tbl = row.parentTable;
      if (!tbl) return null;
    }

    const cols = tbl.columns;
    if (!cols) return null;

    const col = cols.find((c) => c.name == this.fieldName);

    return col;
  }

  public get labelText(): string {
    if (this.label) return this.label;

    const col = this.columnInfo;
    if (!col) return this.fieldName;

    return col.caption ? col.caption : this.fieldName;
  }

  get isFile(): boolean {
    return this.multiSelectFile != undefined;
  }

  private _isDate: any = undefined;
  public get isDate(): boolean {
    if (this._isDate != undefined) return this._isDate;

    this._isDate = false;

    if (this.type == 'date') {
      this._isDate = true;
      return true;
    }

    const col: ColumnInfo = this.columnInfo;
    if (!col) return false;

    this._isDate = col.type == 'Date';
    return this._isDate;
  }

  public get isDataLoading(): boolean {
    return this.form.isDataLoading;
  }

  public get getFormControl(): AbstractControl {
    const formObj = this.formObject;
    if (!formObj) return null;
    const ctrl = formObj.get(this.fieldName);
    return ctrl;
  }

  public get displayDate(): string {
    if (!this.form) return null;
    if (!this.formObject) return null;

    const ctrl = this.formObject.get(this.fieldName);
    if (!ctrl) return null;
    //return new Date(ctrl.value);
    if (!ctrl.value) return null;

    const dt = new Date(ctrl.value);
    const fmt =
      dt.getSeconds() != 0 || dt.getMinutes() != 0
        ? this.dateTimeFormat
        : this.dateFormat;

    return moment(dt).format(fmt);
  }

  public get displayValue(): string {
    // display value when a toggle or select type control is readonly

    if (!this._changeValueNow) return null;

    const ctrl = this.getFormControl;
    if (!ctrl) return '';
    if (this.isToggle) {
      // if
      const tgl = this.toggleDisplay.find((t) => t.value == ctrl.value);
      return tgl
        ? tgl.display
        : `x-${ctrl.value + JSON.stringify(this.toggleDisplay)}`;
    } else {
      if (this.fieldLookup) {
        // field lookup is available

        // get first item display loading text when data is currently being processed
        if (this.fieldLookup) {
          const item1 = this.fieldLookup[0];
          if (item1) if (item1.key == -1) return item1.text;
        }

        const lkpItem = this.fieldLookup.find((i) => i.key == ctrl.value);
        if (lkpItem) return lkpItem.text;
      }
      return ctrl.value;
    }
  }

  MarkAsNotInitialized() {
    const index = this.form.fieldsInitialized.indexOf(this.fieldName);
    if (index != -1) this.form.fieldsInitialized.splice(index, 1);
  }
  MarkAsInitialized() {
    const index = this.form.fieldsInitialized.indexOf(this.fieldName);
    if (index == -1) this.form.fieldsInitialized.push(this.fieldName);
  }

  ActionClick(e: any) {
    //this.picker.open();
    // this.form.ChangeAsset()
    // check if the current field is an asset field
    if (this.actionClick.observers.length == 0) {
      if (this.columnInfo.isAssetField) {
        this.form.ChangeAsset(this);
      }
    } else {
      this.actionClick.emit({ e: e, source: this });
    }
  }
  ValueChanged(e: any) {
    this.valueChanged.emit({ e: e, sender: this });
  }

  onFocus(e: any) {
    e.srcElement.blur();
  }

  clearDate(e: any) {
    //e.nativeElement.value = '';
    //console.log(e)
    e.value = '';
    this.value = null;
  }

  onFileSelected(event: any) {
    this.fileSelected.emit({ e: event, sender: this });
  }
}
