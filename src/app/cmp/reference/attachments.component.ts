import { DetailsPopup, IPopupButton } from './../../api/cmp/details.popup';
import { AttachmentPreviewComponent } from './../../api/cmp/attachment-preview/attachment-preview.component';
import { Subscription, Observable } from 'rxjs';
import { DataGridBComponent } from '../../api/cmp/data-grid/data-grid-b.component';
import { DataGridComponent } from '../../api/cmp/data-grid/data-grid.component';
import { AppMainServiceService } from '../../svc/app-main-service.service';
import {
  Component,
  Renderer2,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { ModuleCommon } from '../module.common';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss'],
})
export class AttachmentsComponent extends ModuleCommon {
  @ViewChild('rfGrid') rfGrid: DataGridBComponent;
  @ViewChild(AttachmentPreviewComponent) preview: AttachmentPreviewComponent;

  @Input() parentTableCode: string;
  @Input() gridParentKeyValue: number;
  @Input() pathKeyParam: number;

  @Input() RootPath: string = 'RefFiles';
  @Input() TitleField: string = 'RF_DESC';
  @Input() SourcePathField: string = 'RF_PATH_LOC';
  @Input() SourceFileField: string = 'RF_FILENAME';

  @Input() subType: string;

  @Input() parentGrid: DataGridBComponent;
  @Input() forwardLink: boolean = true;

  @Input() width: number = 275;

  constructor(
    public dataSource: AppMainServiceService,
    public dialog: MatDialog,
    public renderer: Renderer2
  ) {
    super(dataSource, dialog, renderer);

    // set view configurations
  }

  get url(): string {
    const base = this.DataSet.urlBase;
    return base.substr(0, base.length - 4) + '/' + this.RootPath;
  }

  private _promptTexts: any = {};
  get  promptTexts(): any {
    if (!this.rfGrid) return {};

    // get selected record count
    const cnt = this.rfGrid.SelectedCount;

    // delete prompt construction
    const recs =
      cnt > 1 ? `${cnt} linked references` : 'selected linked reference';
    this._promptTexts.delete = `You are about to remove ${recs}.<br/>Do you want to continue?`;

    return this._promptTexts;
  }

  private _promptWidths: any = {};
  get promptWidths(): any {
    return this._promptWidths;
  }

  get pathKey(): number {
    if (this.pathKeyParam) return this.pathKeyParam;

    const tbl = this.DataSet.tables[this.parentTableCode];
    if (!tbl) return -1;

    const pathKey = tbl.TableConfig.refFilesLinkPathId;
    if (!pathKey) return -1;

    return pathKey.common
      ? pathKey.common
      : this.subType
      ? pathKey[this.subType]
      : -1;
  }

  get dataManageRF(): any {
    return {
      top: {
        templateGrid: this.rfGrid,
        noLinkFilter: true,
        parentKeyValue: null,
        rights: { allowSelect: true },
        fontFactor: 0.85,
        noFooter: false,
        title: 'Available Reference Files ({RECS})',
        addComponent: {
          component: null,
          data: null,
        },
      },
      bottom: {
        templateGrid: this.rfGrid,
        fontFactor: 0.85,
        rights: { allowSelect: true },
        title: 'Attached Reference ({LINKED} linked, max={LIMIT})',
        noFooter: true,
        maxItems: 50,
      },
    };
  }

  get previewUrl(): string {
    if (!this.rfGrid) return '';
    if (!this.rfGrid.grid) return '';

    const row = this.rfGrid.grid.currentRow;
    const urlObj =row ? this.GetRefURL(row) : null;
    return urlObj ? urlObj.url : '';

    // let path = row.XTRA[this.SourcePathField].replace(/\\/gi, '/').trimStart();
    // if (path.indexOf('/') == 0) path = path.substr(1);

    // let file = row[this.SourceFileField];
    // // return `${this.url}/${path}/${file}`;
    // return `${this.RootPath}/${path}/${file}`;
  }

  get previewUrls():Array<any>{
    // iterate through all the records and form array of url's
    if (!this.rfGrid) return [];
    if (!this.rfGrid.grid) return [];

    const rows:Array<any>  = this.rfGrid.grid.sourceRows;
    if(rows.length==0) return []

    const ret:Array<any> = []
    rows.forEach(r=>{
      const url = this.GetRefURL(r);
      if(url) ret.push(url)
    })

    return  ret;
  }

  private GetRefURL(row?:any):any{
    if(!row){
      if(!this.rfGrid) return null;
      row = this.rfGrid.grid.currentRow;
      if(!row) return null;
    }
    if (!row) return null;

    let path = row.XTRA[this.SourcePathField].replace(/\\/gi, '/').trimStart();
    if (path.indexOf('/') == 0) path = path.substr(1);

    const tbl = row.parentTable;
    const key = row[tbl.keyName]
    let file = row[this.SourceFileField];
    let title = row[this.TitleField];
    // return `${this.url}/${path}/${file}`;
    return {key:key, title: title ? title : file , url:`${this.RootPath}/${path}/${file}`};
  }

  modOnInit(): void {
    this.TableCode = 'rf';
  }

  modAfterViewInit() {
    console.log('Path key: ', this.pathKey);
  }

  OpenAttachment(e: any): Observable<any> {
    console.log("OpenAttachment previewUrls: ",this.previewUrls);
    const ref = this.dialog.open(DetailsPopup, {
      // minWidth: `${600}px`,
      // maxWidth: `${1240}px`,
      // minHeight: `${480}px`,
      // maxHeight: `${700}px`,
      // width: '600px',
      // height: '480px',
      minWidth: `${600}px`,
      minHeight: `${480}px`,
      // width: '800px',
      // height: '450px',
      disableClose: false,

      data: {
        // data belonging to popup
        component: {
          component: AttachmentPreviewComponent,
          data: {
            dataSet: this.DataSet,
            urlObj: this.GetRefURL(),
            urlObjs: this.previewUrls,
            iconFontSize:150
          },
        },
        closeControl: true,
        // buttons: [
        //   {
        //     label: 'Previous',
        //     value: 'previous',
        //     style: 'btn btn-warning',
        //     icon: 'fa fa-chevron-left',
        //   },
        //   {
        //     label: 'Next',
        //     value: 'next',
        //     style: 'btn btn-warning',
        //     icon: 'fa fa-chevron-right',
        //     btnIconRight: true,
        //   },
        // ],
        buttonClick: this.PreviewButtonClick

        // title: 'Select Asset',
        // buttons: this.DataSet.btnCancelAccept,
        // icon: 'fa fa-sitemap',
        // buttonClick: this.AssetSelectButtonClick,
      },
    });

    return ref.afterClosed();

    // return null;
  }

  PreviewButtonClick(e: { button: IPopupButton; sender: any }){
    const {button, sender} = e;
    const ref = e.sender.dialogRef;
    const val = button.value;

    if(val == 'close' || val == 'cancel'){
      ref.close({ value: button.value, sender: sender });
    }else if(val == 'previous'){
      sender.ChildComponent.ShowPrev();
      // console.log(sender, inst)
    }else if(val == 'next'){
      // console.log(sender, inst)
      sender.ChildComponent.ShowNext();
    }
  }


  RemoveLinks(event: any) {
    const { e, data, sender } = event;
    if (data ? data.value != 'yes' : true) return;
    if (sender.selectedRecords.length == 0) return;

    const grid = this.parentGrid ? this.parentGrid.grid : null;
    if (!grid) return;

    const code = grid.sourceTable.tableCode;
    const row = grid.currentRow;
    const key = grid.sourceTable.keyName;
    const keyVal = row[key];

    const tbl = this.DataSet.tables[this.TableCode];
    const links = [
      { child_ids: '', table_code: this.TableCode, action: 'remove' },
    ];
    let ids: string = '';

    sender.selectedRecords.forEach((srow) => {
      ids += (ids ? ',' : '') + srow[tbl.keyName];
    });
    links[0].child_ids = ids;

    const formData: any = {};
    const formRow: any = { __links__: links };

    formRow[key] = keyVal;
    formData[code] = [formRow];

    this.rfGrid.ShowMask('Removing reference link(s). Please wait...');
    const subs: Subscription = this.DataSet.Post(formData).subscribe(
      (res) => {
        console.log('\nSuccess:', res);
        this.rfGrid.RefreshClick(null);
      },
      (err) => {
        console.log('\nError:', err);
      },
      () => {
        console.log('\nPosting complete!');
        this.rfGrid.HideMask();
        subs.unsubscribe();
      }
    );

    console.log(
      'Remove Links: ',
      sender,
      sender.SelectedIds,
      sender.grid.currentRow,
      sender.selectedRecords,
      ', formData:',
      formData
    );
  }
}
