import { Component, Input, OnInit, AfterViewInit, ElementRef, HostBinding, HostListener } from '@angular/core';
import { QrySpansHeaderRow } from 'src/app/svc/app.tables';
import { SpanColors, EVENT_TYPE } from './freespan.component';
import { SpanPipeComponent } from './span-pipe.component';

@Component({
  selector: 'app-span-bar',
  templateUrl: './span-bar.component.html',
  styleUrls: ['./span-bar.component.scss']
})
export class SpanBarComponent implements OnInit, AfterViewInit {

  @HostBinding('style.min-width') barMinWidth: string;
  @HostBinding('style.max-width') barMaxWidth: string;
  @HostBinding('style.left') barLeft: string;

  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    if (this.eventType == EVENT_TYPE.SPAN || this.eventType == EVENT_TYPE.STRAKE) {
      this.barMaxWidth = `${this.pxSpanLengthFinal}px`;
    } else {
      this.barMaxWidth = '0px';
    }
    this.barMinWidth = this.barMaxWidth;
    this.barLeft = `${this.pxSpanLeftFinal}px`;
  }

  constructor(private elRef: ElementRef) { }

  private _pipe: SpanPipeComponent;
  @Input() set pipe(value: SpanPipeComponent) {
    this._pipe = value;
    // console.log("Bar pipe: ", this._pipe);
  }
  get pipe() {
    return this._pipe;
  }

  private _event: QrySpansHeaderRow;
  @Input() set event(value: QrySpansHeaderRow) {
    this._event = value;
    // console.log("Bar Event: ", value,", length:",this.pxSpanLeft, " elRef:", this.elRef);
  }

  get event(): QrySpansHeaderRow {
    return this._event;
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

  get title(): string {
    const e = this.event;
    if (!e) return '';
    if (this.isSpan || this.isStrake) return `Start Kp : ${e.SP_KS}\nEnd Kp : ${e.SP_KE}\nLength : ${e.SP_LEN} m\nHeight : ${e.SP_HT!=null ? e.SP_HT + ' mm' : '(na)'}\nStart Surface : ${e.SP_STS}\nInter. Surface : ${e.SP_STI}\nEnd Surface : ${e.SP_STE}`;
    if (this.isStabilization || this.isBerm || this.isSeabed) return `Kp : ${e.SP_KS}`
    return ''
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


  get pxFactor(): number {
    return this.pipe.spanComponent.pxFactor;
  }


  get spanLabel(): string {
    return `${this.event.SP_HT ? this.event.SP_HT :'<na>'}/${this.event.SP_LEN}`
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

  get loadingData(): boolean {
    return this.pipe.spanComponent.loadingData;
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

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    this.handleResize(null);
  }

}
