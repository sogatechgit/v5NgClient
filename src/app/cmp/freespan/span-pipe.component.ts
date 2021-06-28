import { Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { QrySpansHeaderRow } from 'src/app/svc/app.tables';
import { FreespanComponent, SpanColors, EVENT_TYPE } from './freespan.component';

@Component({
  selector: 'app-span-pipe',
  templateUrl: './span-pipe.component.html',
  styleUrls: ['./span-pipe.component.scss']
})
export class SpanPipeComponent implements OnInit {

  @ViewChild('pipe') pipe: ElementRef;

  @Input() campaignTitle: string = '';
  @Input() surveyId: number;

  private _spanComponent: FreespanComponent;
  @Input() set spanComponent(value: FreespanComponent) {
    this._spanComponent = value;
  }

  private _allEvents: Array<QrySpansHeaderRow>
  @Input() set allEvents(value: Array<QrySpansHeaderRow>) {

    // console.log("pipe allEvents! ...",value)

    this._allEvents = value;
    this._localEvents = value.filter(evt => evt.SP_SV == this.surveyId)

    this._localEvents.forEach(evt => {
      const marks: Array<PipeElement> = [];
      marks.push(new PipeElement(this, evt));
      this._markers = marks;
    })

    console.log("### LOCAL EVENTS!: ", this.markers)

    //if(this._localEvents ? this._localEvents.length : false) console.log("### events: ", this.surveyId, this._localEvents)
  }

  private _markers: Array<PipeElement>
  get markers(): Array<PipeElement> {
    return this._markers;
  }

  get pxPipeLeft(): number {
    // return -1;
    if (!this.pipe) return -1;
    return this.pipe.nativeElement.offsetLeft;
  }

  get pxPipeLeftOffset(): number {
    return this.spanComponent.startKpPx - this.pxPipeLeft;
  }

  get pxFactor(): number {
    return this.spanComponent ? this.spanComponent.pxFactor : -1;
  }

  private _localEvents: Array<QrySpansHeaderRow>
  get localEvents(): Array<QrySpansHeaderRow> {
    if (!this._localEvents) return [];
    return this._localEvents;
  }

  get firstEvent(): QrySpansHeaderRow {
    if (this.localEvents.length == 0) return null;
    this.localEvents[0];
  }


  get allEvents(): Array<QrySpansHeaderRow> {
    return this._allEvents;
  }

  get spanComponent(): FreespanComponent {
    return this._spanComponent;
  }

  constructor() { }

  ngOnInit(): void {
  }


  RemoveCampaign() {
    const svy = this.spanComponent.surveys.find(sv => sv.id == this.surveyId);
    if (svy) svy.active = false;
  }

}



export class PipeElement {
  constructor(public pipe: SpanPipeComponent, public event: QrySpansHeaderRow) {
  }


  get eventType(): number {
    if (!this.event) return -1;
    return this.event.SP_TP;
  }

  get spanColor(): string {
    if (!this.event) return 'WHITE';
    switch (this.event.SP_CLR) {
      case 'GRN':
      case 'GREEN':
        return 'GREEN';
      case 'AMB':
      case 'AMBER':
      case 'ORA':
      case 'ORANGE':
        return 'AMBER';
      case 'RED':
        return 'RED';
      default:
        return 'WHITE';
    }
  }

  get isGreen(): boolean {
    return this.spanColor == 'GREEN';
  }
  get isAmber(): boolean {
    return this.spanColor == 'AMBER';
  }
  get isRed(): boolean {
    return this.spanColor == 'RED';
  }

  get isVisible(): boolean {
    if (this.isGreen && this.pipe.spanComponent.showGreen) return true;
    if (this.isAmber && this.pipe.spanComponent.showAmber) return true;
    if (this.isRed && this.pipe.spanComponent.showRed) return true;
    return false;
  }


  get isSpan(): boolean {
    // return false;
    return this.eventType == EVENT_TYPE.SPAN
  }
  get isStrake(): boolean {
    // return false;
    return this.eventType == EVENT_TYPE.STRAKE
  }

  get isStabilization(): boolean {
    // return false;
    return this.eventType == EVENT_TYPE.STABILIZATION
  }
  get isSeabed(): boolean {
    // return false;
    return this.eventType == EVENT_TYPE.SEABED
  }

  get isBerm(): boolean {
    // return false;
    return this.eventType == EVENT_TYPE.BERM
  }


  get title(): string {
    const e = this.event;
    if (!e) return '';
    if (this.isSpan || this.isStrake) return `Start Kp : ${e.SP_KS}\nEnd Kp : ${e.SP_KE}\nLength : ${e.SP_LEN} m\nHeight : ${e.SP_HT != null ? e.SP_HT + ' mm' : '(na)'}\nStart Surface : ${e.SP_STS}\nInter. Surface : ${e.SP_STI}\nEnd Surface : ${e.SP_STE}`;
    if (this.isStabilization || this.isBerm || this.isSeabed) return `Kp : ${e.SP_KS}`
    return ''
  }

  get pxFactor(): number {
    return this.pipe.spanComponent.pxFactor;
  }


  get spanLabel(): string {
    return `${this.event.SP_HT ? this.event.SP_HT : '<na>'}/${this.event.SP_LEN}`
  }
  get loadingData(): boolean {
    return this.pipe.spanComponent.loadingData;
  }


  get isLeftOverflow(): boolean {
    return !this.loadingData && (this.pxSpanLeft < 0);
  }

  get isRightOverflow(): boolean {
    return !this.loadingData && ((this.pxSpanLeft + this.pxSpanLength) > this.pipe.spanComponent.pipeWidthPx);
  }


  get pxSpanLeft(): number {
    return (this.event.SP_KS * 1000.0 - this.pipe.spanComponent.kpStart) * this.pxFactor;
  }

  get pxSpanLeftFinal(): number {
    if (!this.isLeftOverflow) return this.pxSpanLeft + this.pipe.pxPipeLeftOffset;
    // return this.pipe.spanComponent.startKpPx;
    return this.pipe.pxPipeLeftOffset;
  }

  get pxSpanLength(): number {
    if (!this.event) return 0;

    const offset = 0.0005

    const pxLength = 1000 * ((this.event.SP_KE + offset) - this.event.SP_KS) * this.pxFactor;
    return !this.isLeftOverflow ? pxLength : (pxLength - Math.abs(this.pxSpanLeft));
  }

  get pxSpanLengthFinal(): number {
    // return this.pxSpanLength;
    // return 0.5;
    return (!this.isRightOverflow ? this.pxSpanLength : this.pxSpanLength - (this.pxSpanLeft + this.pxSpanLength - this.pipe.spanComponent.pipeWidthPx));
  }

  get spanBack(): string {
    if (!this.event) return SpanColors.WHITE;
    switch (this.event.SP_CLR) {
      case 'GRN':
      case 'GREEN':
        return SpanColors.GREEN;
      case 'AMB':
      case 'AMBER':
      case 'ORA':
      case 'ORANGE':
        return SpanColors.AMBER;
      case 'RED':
        return SpanColors.RED;
      default:
        return SpanColors.WHITE;

    }
  }


}