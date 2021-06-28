import { AppMainServiceService } from './../../svc/app-main-service.service';
import { FormCommon } from './../form.common';
import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { AppDataset } from 'src/app/svc/app-dataset.service';
import { RequestParams } from 'src/app/api/mod/app-params.model';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SurveySelectComponent } from './survey-select.component';
import { DetailsPopup } from 'src/app/api/cmp/details.popup';
import { QrySpansHeaderRow } from 'src/app/svc/app.tables';
import { FormControl, FormGroup } from '@angular/forms';
import { retry } from 'rxjs/operators';

@Component({
  selector: 'app-freespan',
  templateUrl: './freespan.component.html',
  styleUrls: ['./freespan.component.scss', './../module.common.scss']
})
export class FreespanComponent extends FormCommon implements OnInit, AfterViewInit {

  public form: FormGroup = new FormGroup({});

  private SPAN_EVENTS: string = "25,26,";

  private _pipes: Array<IPipe> = [];
  get pipes(): Array<IPipe> {
    return this._pipes;
  }

  private _surveys: Array<ISurvey> = [];
  get surveys(): Array<ISurvey> {
    return this._surveys;
  }

  private _events: Array<QrySpansHeaderRow> = [];
  get events(): Array<QrySpansHeaderRow> {
    return this._events;
  }

  private _loadingData: boolean = false;
  get loadingData(): boolean {
    return this._loadingData;
  }


  get clrGreen(): string {
    return SpanColors.GREEN;
  }
  get clrAmber(): string {
    return SpanColors.AMBER;
  }
  get clrRed(): string {
    return SpanColors.RED;
  }

  constructor(public dialog: MatDialog, public dataSource: AppMainServiceService) {
    super(dataSource);
  }

  // @HostBinding('style.background-color') back: string;

  @ViewChild('pipeSelect') pipeSelect: ElementRef;
  @ViewChild('gridStart') gridStart: ElementRef;
  @ViewChild('gridEnd') gridEnd: ElementRef;

  @Input() axCount: number = 50;

  ngOnInit(): void {

    // this.form.addControl("sel_pipeline", new FormControl(0))
    this.form.addControl("sel_pipeline", new FormControl(9640))
    //
    this.form.addControl("sel_kprange", new FormControl(500))
    // this.form.addControl("txt_centerkp", new FormControl(200))
    // this.form.addControl("txt_centerkp", new FormControl(469.583))
    // this.form.addControl("txt_centerkp", new FormControl(469.423))

    this.form.addControl("txt_centerkp", new FormControl(474.1355))

    this.form.addControl("tgl_green", new FormControl(true))
    this.form.addControl("tgl_amber", new FormControl(true))
    this.form.addControl("tgl_red", new FormControl(true))

    // Extract survey records
    const params: Array<RequestParams> = [
      { code: 'svy', sortFields: '-SVY_MAIN_DATE_START', includedFields: 'SVY_MAIN_ID`SVY_MAIN_TITLE`SVY_MAIN_DATE_START`SVY_MAIN_DATE_END' },
      {
        code: 'node', includedFields: 'REC_TAG`NODE_ID`NODE_DESC',
        filter: `{REC_TAG|in|${this.pipelineIds}}`
      }
    ];

    this.ds.Get(params, {
      onSuccess: data => {
        const svys: Array<ISurvey> = [];

        const surveyElement = 0;
        const pipelinesElement = 1;

        data.processed.data[surveyElement].forEach(svy => {
          svys.push({ id: svy.SVY_MAIN_ID, name: svy.SVY_MAIN_TITLE, active: false, events: [] })
        })

        this._surveys = svys;

        const pps: Array<IPipe> = [];
        data.processed.data[pipelinesElement].forEach(pipe => {
          const item: IPipe = { id: pipe.REC_TAG, code: pipe.NODE_ID, name: pipe.NODE_DESC };

          const ppl = this.pipelines.find(pl => pl.id == pipe.REC_TAG);
          if (ppl) {
            item.kpStart = ppl.start_kp;
            item.kpEnd = ppl.end_kp;
          }

          pps.push(item)
        })

        this._pipes = pps;

        setTimeout(() => {
          this.PipeSelect();
          this._loadingData = false;
        });

      }
    })

    const setXAxis = this.axyLines;
    // if (setXAxis.length == 0) setTimeout(() => console.log("pipelineIds: ", this.pipelineIds, "\naxyLines: ", this.axyLines));


  }

  ngAfterViewInit() {

  }

  get ds(): AppDataset {
    return this.dataSource.ActiveSource.appDataset;
  }

  get kpRange(): number {
    // meters
    return this.form.get('sel_kprange').value;
  }

  get kpCenter(): number {
    // meters
    return this.form.get('txt_centerkp').value * 1000;
    // return 143000;
    //return 143545.5;
    //return 450000;
  }

  get kpStart(): number {
    return this.kpCenter - this.kpRange / 2.0;
  }

  get kpEnd(): number {
    return this.kpCenter + this.kpRange / 2.0;
  }

  get showGreen(): boolean {
    return this.form.get("tgl_green").value
  }
  get showAmber(): boolean {
    return this.form.get("tgl_amber").value
  }
  get showRed(): boolean {
    return this.form.get("tgl_red").value
  }

  fmtVal(val: number) {
    return Number.parseFloat(String(val / 1000)).toFixed(3);
  }

  private _axyLines: Array<number>;
  private _axyProcessing: boolean = false;
  get axyLines(): Array<number> {

    // this._axyLines already contains the Y axis definition
    if (this._axyLines) return this._axyLines;

    // this._axyLines on initial loading or this._axyLines was set to null on event triggered

    if (!this._axyProcessing) {
      this._axyProcessing = true;
      const vals: Array<number> = [];
      const kpGap: number = this.kpRange / this.axCount;


      // get starting kp;
      const kpStart = this.kpCenter - (kpGap * this.axCount / 2);

      for (let idx = 0; idx <= this.axCount; idx++) {
        vals.push(kpStart + idx * kpGap);
      }

      console.log("Axes Count: ", vals.length);


      this._axyLines = vals;
      this._axyProcessing = false;

    }
    return [];
  }

  get pipelines(): Array<any> {
    return this.ds.tblNodesAttrib.clientConfig.pipelines;
  }

  get pipe(): IPipe {
    //sel_pipeline
    return null;
  }

  private _pipelineIds: string;
  get pipelineIds(): string {

    if (this._pipelineIds == undefined) {
      this._pipelineIds = "";
      const ids: Array<string> = []

      this.pipelines.forEach(pipe => ids.push(pipe.id));

      this._pipelineIds = ids.join(',');
    }

    return this._pipelineIds
  }

  get currentPipe(): number {
    if (!this.pipeSelect) return -1;
    return this.pipeSelect.nativeElement.value;
  }

  private _currentPipeItem: IPipe = null;
  get currentPipeItem(): IPipe {
    return this._currentPipeItem;
  }
  set currentPipeItem(value: IPipe) {
    this._currentPipeItem = value;
  }



  get startKpPx(): number {
    if (!this.gridStart) return -1;
    return this.gridStart.nativeElement.offsetLeft;
    // return this.gridStart.nativeElement.clientLeft;
  }

  get endKpPx(): number {
    if (!this.gridEnd) return -1;
    return this.gridEnd.nativeElement.offsetLeft;
    // return this.gridEnd.nativeElement.clientLeft;
  }

  get pipeWidthPx(): number {
    if (this.endKpPx == -1 || this.startKpPx == -1) return -1;
    return this.endKpPx - this.startKpPx;
  }

  get pxFactor(): number {
    if (!this.kpRange) return -1;
    return this.pipeWidthPx / this.kpRange;
  }

  get currentSurveys(): string {
    const ids: Array<number> = [];
    const actsvy = this.surveys.filter(svy => svy.active);
    actsvy.forEach(svy => ids.push(svy.id))

    return ids.join(',');
  }

  get gridTemp(): string {
    return `auto / repeat(${this.axCount + 1},1fr)`;
  }

  get minRange(): number {
    if (!this.currentPipeItem) return -1;
    return this.currentPipeItem.kpStart;
  }

  get maxRange(): number {
    if (!this.currentPipeItem) return -1;
    return this.currentPipeItem.kpEnd;
  }

  get minCenter(): number {
    if (!this.kpStart) return 0;
    return (this.minRange + this.kpRange / 2.0 / 1000.0);
  }

  get maxCenter(): number {
    if (!this.kpEnd) return 0;
    return (this.maxRange - this.kpRange / 2.0 / 1000.0);
  }

  get kpRangeText(): string {

    const min = this.minRange;
    const max = this.maxRange;

    if (min == -1 && max == -1) return '';

    return `${min} to ${max}`

  }

  get activeSurveys():Array<any>{
    return this.surveys.filter(sv=>sv.active);
  }

  

  ShowToggle(event: any) {
    const id = event.target.id;
    this.form.get(id).setValue(!this.form.get(id).value);
  }

  CenterChanged(event: any) {
    this.GetSpansData();

    //this._axyLines = null;  // set to null to force re-assignment of grid y axes properties
  }

  ChangeRange(event: any) {
    this.GetSpansData();
    // this._axyLines = null;  // set to null to force re-assignment of grid y axes properties
  }



  KpNav(dir: string) {
    console.log("Direction: ", dir, ", current center: ", this.kpCenter, this.kpStart, this.kpEnd)

    // const pipe = this.pipelines.find()
    switch (dir) {
      case 'F':
        console.log("Min center: ", this.minCenter, ", minRange: ", this.minRange, ", maxRange: ", this.maxRange, ", kp range: ", this.kpRange)
        this.form.get('txt_centerkp').setValue(+this.minCenter)
        break;
      case 'P':
        this.form.get('txt_centerkp').setValue(+this.kpStart / 1000.0)
        break;
      case 'N':
        this.form.get('txt_centerkp').setValue(+this.kpEnd / 1000.0)

        break;
      case 'L':
        console.log("Max center: ", this.maxCenter)
        this.form.get('txt_centerkp').setValue(+this.maxCenter)
        break;
      default:
    }

    // this._axyLines = null

    this.CenterChanged(null);
  }

  ShowData(event: any) {
    console.log('Show span data...', this.startKpPx, this.endKpPx, this.pipeWidthPx)
  }

  PipeSelect() {
    const id = this.currentPipe;
    if (id != -1) {
      this.currentPipeItem = this.pipes.find(pl => pl.id == id);

      // set center kp
      this.form.get('txt_centerkp').setValue(this.currentPipeItem.kpStart + (this.currentPipeItem.kpEnd - this.currentPipeItem.kpStart) / 2.0)

    } else {
      this.currentPipeItem = null;
      this.form.get('txt_centerkp').setValue(0);
    }





    // console.log("Pipe selected: ", id, pipe);

    this.GetSpansData();
  }

  GetSpansData(onSuccess?: Function) {

    if(this.activeSurveys.length == 0) return;

    const ks = this.kpStart / 1000.0;
    const ke = this.kpEnd / 1000.0;

    const pipeId = this.currentPipe;
    const svyIds = this.currentSurveys;

    this._loadingData = true;

    if (+pipeId == 0) {
      console.log('No pipeline selected!');
      return;
    }

    if (!svyIds) {
      console.log('No campaign(s) selected!');
      return;
    }

    const params: Array<RequestParams> = [
      {
        code: 'vwfspan',
        filter: `{SP_SV|in|${svyIds}}^{SP_LOC|${pipeId}}^(({SP_KS|lte|${ks}}^{SP_KE|gte|${ks}})|({SP_KS|lte|${ke}}^{SP_KE|gte|${ke}})|({SP_KS|gte|${ks}}^{SP_KE|lte|${ke}})|({SP_KS|lte|${ks}}^{SP_KE|gte|${ke}}))`,
        snapshot: true,
        sortFields: '-SP_SV`SP_KS'
      }
    ]

    this.ds.Get(params, {
      onSuccess: data => {
        this._events = data.processed.data[0];
        this._axyLines = null;

        if (onSuccess) onSuccess(data);
        this._loadingData = false;

      }, onError: err => {
        console.log("Error: ", err)
        this._loadingData = false;
      }

    });

  }

  ChooseSurveys(event: any) {
    console.log('Choose survey ...');

    //const actsvy = this.surveys.filter(svy => (svy.id == 1 || svy.id == 68))
    // const actsvy = this.surveys.filter(svy => (svy.id == 13 || svy.id == 68))
    // console.log("ActiveSurveys: ", actsvy)
    // actsvy.forEach(svy => svy.active = true);



    // console.log("pipeId: ", pipeId, ", svyIds: ", svyIds)


    // this.GetSpansData();
    // return;

    const subsSelect = this.OpenSurveySelect().subscribe(
      (data) => {
        const { sender, button } = data;
        if (button.value == 'accept') {
          console.log('SelectedSurveys: ', sender.ChildComponent.surveyIds, this.surveys);
          this.surveys.forEach(svy => {
            svy.active = (sender.ChildComponent.surveyIds.indexOf(svy.id) != -1);
          })
          this.GetSpansData();
        }
      },
      (err) => {
        console.log('\nOpenRecordTypeSelect, Error ', err);
      },
      () => subsSelect.unsubscribe()
    );

  }

  ExtractData() {
    /*
    
    svyhdr|`svypos@SP,SVY_HDR_START_POS_ID,SVY_POS_ID;`svypos@EP,SVY_HDR_END_POS_ID,SVY_POS_ID;
    
    SVY_HDR_MAIN_ID`SP.SVY_POS_KP@ks`EP.SVY_POS_KP@ke`SVY_HDR_COLOUR`SVY_INTEGER_A@ht`SVY_SINGLE_A@ln`SVY_TEXT_A@sts`SVY_TEXT_B@ste`SVY_TEXT_C@sti`SVY_HDR_EVT_ID@tp
    
    {SVY_HDR_MAIN_ID|in|1}^{SVY_HDR_NOD_ID|9640}^({SVY_HDR_EVT_ID|in|25,26,5,41}|({SVY_HDR_EVT_ID|1}^{SVY_TEXT_B|Strake}))
    
    -SVY_HDR_MAIN_ID
    
    */

    const params: Array<RequestParams> = [
      { code: 'svy', sortFields: '-SVY_MAIN_DATE_START', includedFields: 'SVY_MAIN_ID`SVY_MAIN_TITLE`SVY_MAIN_DATE_START`SVY_MAIN_DATE_END' },
      { code: 'node', includedFields: 'REC_TAG`NODE_ID`NODE_DESC', filter: `{REC_TAG|in|${this.pipelineIds}}` }
    ];


  }

  OpenSurveySelect(): Observable<any> {
    const tbl = this.sourceTable;
    const ref = this.dialog.open(DetailsPopup, {
      minWidth: '800px',
      minHeight: '600px',
      disableClose: false,
      data: {
        // data belonging to popup
        component: {
          // params of popup component
          component: SurveySelectComponent,
          data: {
            hostObject: this

            // defaultValue: this.RecordTypeSelectDefault,
            // form: new FormGroup({}),
            // tableConfig: tbl.TableConfig,
            // recordTypeOptions: tbl.recordTypeOptions,
            // moduleExchangeInfo: this.moduleExchangeInfo,
          },
        },
        title: 'Select survey(s) to plot',
        buttons: this.ds.btnCancelAccept,
        icon: 'fa fa-check',
        buttonClick: this.SurveySelectButtonClick,
      },
    });

    return ref.afterClosed();
  }

  SurveySelectButtonClick(args: any) {
    args.sender.dialogRef.close(args);
  }


}

export interface ISurveyEvent {
  type: string;
  startKp: number;
  endKp: number;
  Kp: number;
  length: number;
  height: number;
  startSurface: string;
  interSurface: string;
  endSurface: string;
}

export interface IPipe {
  id: number;
  code: string;
  name: string;
  kpStart?: number;
  kpEnd?: number;
}

export interface ISurvey {
  id: number;
  name: string;
  active: boolean;
  type?: number;
  startDate?: Date;
  endDate?: Date;
  events: Array<ISurveyEvent>;
}

export enum SpanColors {
  //GREEN = '#28a745',
  GREEN = '#097d23',
  AMBER = '#ffc107',
  RED = '#dc3545',
  WHITE = 'white'
}

export enum SpanEvents {
  SPAN = 25,
  STABILIZATION = 26,
  SEABED = 41,
  BERM = 5,

  STRAKE = 1,  // SVY_HDR_EVT_ID=ADD FEATURE(1) WHERE SVY_TEXT_B = Strake
}

export enum EVENT_TYPE {
  SPAN = 25,
  BERM = 5,
  STRAKE = 1,
  STABILIZATION = 26,
  SEABED = 41
}


