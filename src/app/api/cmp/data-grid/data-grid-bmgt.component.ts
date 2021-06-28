import { ColumnInfo } from './../../mod/app-column.model';
import { IPopupPrompts } from './../details.popup';
import { Observable, Subscription } from 'rxjs';
import { AppFormAComponent } from './../app-form-a/app-form-a.component';
import {
  IRequestInfo,
  TableRelationActions,
} from './../../mod/app-common.classes';
import { AppDataset } from './../../../svc/app-dataset.service';
import { DataGridBComponent } from './data-grid-b.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

@Component({
  selector: 'app-data-grid-bmgt',
  templateUrl: './data-grid-bmgt.component.html',
  styleUrls: ['./data-grid-bmgt.component.scss', '../pop-ups.scss'],
})
export class DataGridBMgtComponent implements OnInit, AfterViewInit {
  @ViewChild('contentSection') contentSection: any;
  @ViewChild('actions') actions: any;
  @ViewChild('heading') heading: any;

  @ViewChild('form') form: AppFormAComponent;
  @ViewChild('topGrid') topGrid: DataGridBComponent;
  @ViewChild('bottomGrid') bottomGrid: DataGridBComponent;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DataGridBMgtComponent>
  ) {}

  ngOnInit(): void {
    console.log(
      '\nData: ',
      this.data,
      ', this.topCfg:',
      this.topCfg,
      ', this.BopCfg; ',
      this.botCfg
    );
  }

  ngAfterViewInit() {
    if (this.form) {
      this.form.moduleExchangeInfo = this.botCfg.templateGrid.moduleExchangeInfo;
    }
  }

  topProcessing: boolean = true;
  bottomProcessing: boolean = true;

  get isProcessing(): boolean {
    return this.topProcessing || this.bottomProcessing;
  }

  get gridManagementData(): any {
    if (!this.data) return null;
    return this.data.gridManagementData;
  }

  get manageTitle(): string {
    if (!this.tempGrid) return 'Manage Links';
    return this.tempGrid.manageTitle;
  }

  private _currentRowIds: Array<number>;
  private _includedRowIds: Array<number>;
  private _initialCollection: boolean = true;
  get includedRowIds(): Array<number> {
    if (this._includedRowIds == undefined) {
      // initialize arrays
      this._includedRowIds = [];
      if (this._initialCollection) this._currentRowIds = [];

      if (this.botCfg ? this.botCfg.templateGrid : false) {
        this.botCfg.templateGrid.grid.sourceRows.forEach((row) => {
          this._includedRowIds.push(row.keyVal);
          if (this._initialCollection) this._currentRowIds.push(row.keyVal);
        });
      }
      // unset initial collection flag
      if (this._initialCollection) this._initialCollection = false;
    }
    return this._includedRowIds;
  }

  set includedRowIds(value: Array<number>) {
    this._includedRowIds = value;
  }

  get bottomTitle(): string {
    if (!this.botCfg ? true : !this.botCfg.title) return '';

    const add = this.addedRowIds.length;
    const rem = this.removedRowIds.length;

    return (
      this.botCfg.title +
      `${add ? ', Added=' + add : ''}${rem ? ', Removed=' + rem : ''}`
    );
  }

  get addedRowIds(): Array<number> {
    // if included ids is empty, no additional links were made
    if (this.includedRowIds.length == 0) return [];
    // if initially there were no linked records,
    // therefore all records in the included ids are newly selected links
    if (this._currentRowIds.length == 0) return this.includedRowIds;

    // all records that are in the included ids but not in the
    // currently linked ids are considered newly attached records
    const tmpIds: Array<number> = [];
    this.includedRowIds.forEach((id) => {
      if (this._currentRowIds.indexOf(id) == -1) tmpIds.push(id);
    });

    return tmpIds;
  }

  get removedRowIds(): Array<number> {
    // initially there were no linked record, removal is not possible
    if (this._currentRowIds.length == 0) return [];
    // all were removed, therefore remove all originally linked records
    if (this.includedRowIds.length == 0) return this._currentRowIds;

    // all records that are not in the included row but
    // existing in the initially linked records
    const tmpIds: Array<number> = [];
    this._currentRowIds.forEach((id) => {
      if (this.includedRowIds.indexOf(id) == -1) tmpIds.push(id);
    });
    return tmpIds;
  }

  private _topCfg: ListConfig;
  get topCfg(): ListConfig {
    if (this._topCfg == undefined)
      this._topCfg = this.GetListConfig(
        this.gridManagementData ? this.gridManagementData.top : null
      );
    return this._topCfg;
  }

  private _botCfg: ListConfig;
  get botCfg(): ListConfig {
    if (this._botCfg == undefined)
      this._botCfg = this.GetListConfig(
        this.gridManagementData ? this.gridManagementData.bottom : null
      );
    return this._botCfg;
  }

  GetListConfig(cfg: any): ListConfig {
    const ret: ListConfig = {};
    if (!cfg) return ret;

    const {
      dataSet,
      templateGrid,
      tableCode,
      parentTableCode,
      parentKeyValue,
      rights,
      noFooter,
      customGrid,
      autoGrid,
      forwardLink,
      noLinkFilter,
      fontFactor,
      title,
      maxItems,
    } = cfg ? cfg : ret;

    const grid: DataGridBComponent = templateGrid;

    //
    if (grid) {
      // parent grid is defined where list propeties will be inherited from
      // but specific values are given to individual property, it will
      // be used instead of the one from the template grid
      ret.templateGrid = templateGrid;
      ret.dataSet = dataSet != undefined ? dataSet : grid.dataSet;
      ret.tableCode = tableCode != undefined ? tableCode : grid.tableCode;
      ret.parentTableCode =
        parentTableCode != undefined ? parentTableCode : grid.parentTableCode;

      ret.parentKeyValue =
        parentKeyValue != undefined ? parentKeyValue : grid.parentKeyValue;

      ret.rights = rights != undefined ? rights : grid.rights;
      ret.noFooter = noFooter != undefined ? noFooter : grid.noFooter;
      ret.customGrid = customGrid != undefined ? customGrid : grid.customGrid;
      ret.autoGrid = autoGrid != undefined ? autoGrid : grid.autoGrid;

      ret.forwardLink = noLinkFilter
        ? undefined
        : forwardLink != undefined
        ? forwardLink
        : grid.forwardLink;
      ret.fontFactor = fontFactor != undefined ? fontFactor : grid.fontFactor;
      ret.title = title != undefined ? title : grid.title;
      //
    } else {
      // template grid component is not defined
      ret.dataSet = dataSet;
      ret.tableCode = tableCode;
      ret.parentTableCode = parentTableCode;
      ret.parentKeyValue = parentKeyValue;
      ret.rights = rights;
      ret.noFooter = noFooter;
      ret.customGrid = customGrid;
      ret.autoGrid = autoGrid;
      ret.forwardLink = forwardLink;
      ret.fontFactor = fontFactor;
      ret.title = title;
    }

    ret.maxItems = maxItems;

    return ret;
  }

  get totalCount(): number {
    // current linked items + items to be linked
    if (!this.topGrid || !this.bottomGrid || !this.topCfg || !this.botCfg)
      return 0;
    if (!this.botCfg.maxItems) return 0;

    let count: number = this.bottomGrid.IncludedCount;
    if (!this.topGrid.noSelection) count += this.topGrid.SelectedCount;

    return count;
  }
  get limitReached(): boolean {
    if (!this.bottomGrid || !this.botCfg) return false;
    if (!this.botCfg.maxItems) return false;

    const limit = this.botCfg.maxItems;
    if (limit == undefined) return false;

    return this.totalCount > limit;
  }

  get topRows(): Array<any> {
    if (!this.topGrid) return [];
    if (!this.topGrid.grid) return [];
    if (!this.topGrid.grid.sourceRows) return [];
    return this.topGrid.grid.sourceRows;
  }
  get bottomRows(): Array<any> {
    if (!this.bottomGrid) return [];
    if (!this.bottomGrid.grid) return [];
    if (!this.bottomGrid.grid.sourceRows) return [];
    return this.bottomGrid.grid.sourceRows;
  }

  get topReqInfo(): IRequestInfo {
    if (!this.topGrid) return null;
    return this.topGrid.reqInfo;
  }

  get topRecordCount(): number {
    if (this.topReqInfo)
      return this.topReqInfo.totalRecords ? this.topReqInfo.totalRecords : 0;
  }

  get bottomRecordCount(): number {
    if (this.bottomReqInfo)
      return this.bottomReqInfo.totalRecords
        ? this.bottomReqInfo.totalRecords
        : 0;
  }

  get bottomReqInfo(): IRequestInfo {
    if (!this.bottomGrid) return null;
    return this.bottomGrid.reqInfo;
  }

  private _ready = false;
  public get ready(): boolean {
    return this._ready;
  }
  onFocus(e: any) {
    e.srcElement.blur();
  }
  public get contentHeight(): number {
    if (!this.ready) return 0;

    if (!this.actions || !this.heading) return 0;
    return (
      this.actions.nativeElement.offsetTop -
      (this.heading.nativeElement.offsetTop +
        this.heading.nativeElement.offsetHeight)
    );
  }

  BottomDataExtracted(e: any) {
    this.topProcessing = true;
    this.bottomProcessing = false;
    this.RefreshTopGrid();
  }

  TopDataExtracted(e:any){
    this.topProcessing = false;
  }

  RefreshTopGrid() {
    // build exclusion key id filter
    setTimeout(() => {
      this.topGrid.ExcludedIds = [];

      const rows = this.bottomRows;
      if (rows.length) {
        rows.forEach((row) => {
          this.topGrid.ExcludedIds.push(row.keyVal);
        });
      }
      this.topGrid.RefreshClick(null);
    });
  }

  IncludeExcludeAll(includeAll?: boolean) {
    let processed: boolean = false;
    if (includeAll == undefined) includeAll = true;
    if (!includeAll) {
      this.includedRowIds = [];
      processed = true;
    }
    if (processed) this.bottomGrid.RefreshClick(null);
  }

  IncludeExcludeSelected(include?: boolean) {
    if (include == undefined) include = true;
    let processed: boolean = false;

    if (include && this.topRows.length != 0) {
      // add current record or selected records to the linked records
      // const row = this.bottomGrid.sourceTable.NewRow();
      if (this.topGrid.SelectMode) {
        if (this.topGrid.SelectedIds.length) {
          this.topGrid.SelectedIds.forEach((i) => this.includedRowIds.push(i));
          processed = true;
        }
        if (processed) this.topGrid.SelectedIds = [];
      } else {
        const row = this.topGrid.grid.currentRow;
        this.includedRowIds.push(row.keyVal);
        processed = true;
      }
    } else if (!include && this.bottomRows.length != 0) {
      // remove record from the selection
      if (this.bottomGrid.SelectMode) {
        if (this.bottomGrid.SelectedIds.length) {
          this.bottomGrid.SelectedIds.forEach((i) => {
            const idx = this.includedRowIds.indexOf(i);
            if (idx != -1) this.includedRowIds.splice(idx, 1);
          });
          processed = true;
        }
        if (processed) this.bottomGrid.SelectedIds = [];
      } else {
        const row = this.bottomGrid.grid.currentRow;
        const idx = this.includedRowIds.indexOf(row.keyVal);
        if (idx != -1) {
          this.includedRowIds.splice(idx, 1);
          processed = true;
        }
      }
    }
    if (processed) this.bottomGrid.RefreshClick(null);
  }

  private _selected: Array<{
    id: string;
    fieldName: string;
    caption: string;
    order: number;
    selected?: boolean;
  }> = [];
  public get selected(): Array<{
    id: string;
    fieldName: string;
    caption: string;
    order: number;
    selected?: boolean;
  }> {
    return this._selected;
  }

  private _unselected: Array<{
    id: string;
    fieldName: string;
    caption: string;
    order: number;
    selected?: boolean;
  }> = [];
  public get unselected(): Array<{
    id: string;
    fieldName: string;
    caption: string;
    order: number;
    selected?: boolean;
  }> {
    return this._unselected;
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      event.previousContainer.data['selected'] = false;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  itemClicked(sender: any, event: any) {
    sender.selected = !sender.selected;
  }

  clickAction(mode: string) {
    switch (mode) {
      case 'close':
      case 'cancel':
        this.dialogRef.close(null);
        break;
      case 'reset':
        this.ResetSelection();
        break;
      //this.dialogRef.close('reset');
      case 'accept':
        this.AcceptSelection();
        break;
    }
  }

  ResetSelection() {}

  AcceptSelection() {
    const obs: Observable<any> = this.AcceptSelectionObs();
    if (obs) {
      const subs = obs.subscribe(
        (data) => {
          console.log('\nSuccess: ', data);
          if (data.action == 'link_with_change' && data.value == 'yes')
            this.PostLinksUpdate();
        },
        (err) => {
          console.log('\nError: ', err);
        },
        () => {
          console.log('\nComplete!');
          subs.unsubscribe();
        }
      );
    }
  }

  get tempGrid(): DataGridBComponent {
    if (!this.botCfg) return null;
    return this.botCfg.templateGrid;
  }

  PostLinksUpdate() {
    /* post data eg. **************************************************************
     * {
     * 	"an":[
     * 			{
     * 				"AN_ID": 10362,
     *        "AN_UPDATED_DATE":"",
     *        "AN_UPDATED_BY":"",
     * 				"__links__": [
     * 					{	"table_code":"ft",
     * 						"child_ids": "50,3,65",
     * 						"action":"add"
     * 					},
     * 					{	"table_code":"an",
     * 						"child_ids": "10279,10220,10200",
     * 						"action":"add"
     * 					}
     * 				]
     * 			 }
     * 		],
     * 	"__config__": {"useCommonNewKey": false}
     * }
     */
    const grid: DataGridBComponent = this.tempGrid;
    const pGrid: DataGridBComponent = grid.parentGrid;

    const row = grid.parentGrid.grid.currentRow;
    const tbl = row.parentTable;
    const formData: any = { __config__: { useCommonNewKey: false } };
    const details: any = { __links__: [] };

    const upd: ColumnInfo = tbl.UpdatedStampField;
    const updBy: ColumnInfo = tbl.UpdatedByStampField;

    const dataSet: AppDataset = this.botCfg.dataSet;

    // setup details field values
    details[tbl.keyName] = grid.parentKeyValue;
    // include update stamps
    if (upd) details[upd.name] = dataSet.apiCommon.dateStampString;
    if (updBy) details[updBy.name] = dataSet.userInfo.name;

    formData[pGrid.tableCode] = [details];

    const table_code: string =
      grid.tableCode + (grid.linkChildType ? '-' + grid.linkChildType : '');

    if (this.removedRowIds.length) {
      details.__links__.push({
        table_code: table_code,
        child_ids: this.removedRowIds.join(','),
        action: TableRelationActions.REMOVE,
      });
    }
    if (this.addedRowIds.length) {
      details.__links__.push({
        table_code: table_code,
        child_ids: this.addedRowIds.join(','),
        action: TableRelationActions.ADD,
      });
    }

    // console.log(
    //   '\nFormData: ',
    //   formData,
    //   '\nformData JSON: ',
    //   JSON.stringify(formData)
    // );

    console.log('\nPosting...', formData, '\n', JSON.stringify(formData));

    this.form.ShowMask('Saving links updates. Please wait...');

    const subs: Subscription = dataSet.Post(formData).subscribe(
      (res) => {
        console.log('\nSuccess:', res);
        setTimeout(() => this.tempGrid.RefreshClick(null));
        this.dialogRef.close(null);
      },
      (err) => {
        console.log('\nError:', err);
      },
      () => {
        console.log('\nPosting complete!');
        this.form.HideMask();
        subs.unsubscribe();
      }
    );
    //    const subs = this.dataSet.Post(formData).subscribe(
    //   (res) => {
    //     this.UpdateView(data);
    //   },
    //   (err) => {
    //     console.log('\nError deleting record: ', err);
    //   },
    //   () => {
    //     subs.unsubscribe();
    //   }
    // );
  }

  get popPrompts(): IPopupPrompts {
    if (!this.botCfg) return null;
    if (!this.botCfg.dataSet) return null;
    return this.botCfg.dataSet.apiCommon.popPrompts;
  }

  get topRights(): any {
    const obj = JSON.parse(JSON.stringify(this.topCfg.rights));
    // obj.allowAdd=true;
    return obj;
  }

  AcceptSelectionObs(): Observable<any> {
    const form: AppFormAComponent = this.form;

    console.log('\nAdded Ids: ', this.addedRowIds);
    console.log('\nRemoved Ids: ', this.removedRowIds);
    console.log('\nForm: ', this.form);

    // check changes
    // if no changes, promp user nothing to save

    const prompts = this.botCfg.dataSet.apiCommon.popPrompts;
    const reqGridExist: boolean = (
      !this.tempGrid ? true : !this.tempGrid.parentGrid
    )
      ? false
      : true;

    if (
      (this.addedRowIds.length == 0 && this.removedRowIds.length == 0) ||
      !reqGridExist
    )
      // no changes found
      return form.OpenPrompt({
        form: form,
        title: !reqGridExist
          ? 'Missing configuration'
          : this.popPrompts.linkNoSelected.title,
        message: !reqGridExist
          ? 'Template and/or parent grid not defined.'
          : this.popPrompts.linkNoSelected.message,
        icon: this.popPrompts.linkNoSelected.icon,
        icon_color: this.popPrompts.linkNoSelected.icon_color,
        buttons: this.popPrompts.linkNoSelected.buttons,
        action: 'link_no_change',
      });

    // prompt user to confirm save
    return form.OpenPrompt({
      form: form,
      title: this.popPrompts.linkWithSelected.title,
      message: this.popPrompts.linkWithSelected.message,
      icon: this.popPrompts.linkWithSelected.icon,
      icon_color: this.popPrompts.linkWithSelected.icon_color,
      buttons: this.popPrompts.linkWithSelected.buttons,
      action: 'link_with_change',
    });
  }
}

interface ListConfig {
  templateGrid?: DataGridBComponent;
  parentKeyValue?: number;
  dataSet?: AppDataset;
  tableCode?: string;
  parentTableCode?: string;
  rights?: any;
  noFooter?: boolean;
  autoGrid?: boolean;
  customGrid?: string;
  forwardLink?: boolean;
  noLinkFilter?: boolean;
  fontFactor?: number;
  title?: string;
  maxItems?: number;
}
