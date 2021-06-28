import { AppMainServiceService } from './../../svc/app-main-service.service';
import { FormCommon } from './../form.common';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as topojson from "topojson-client";


import * as d3 from 'd3';
import { RequestParams } from 'src/app/api/mod/app-params.model';
import { AppDataset } from 'src/app/svc/app-dataset.service';

import { TblSeismicRow } from './../../svc/app.tables'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

//import * as t from 'topojson';


@Component({
  selector: 'app-seismic',
  templateUrl: './seismic.component.html',
  styleUrls: ['./seismic.component.scss', './../module.common.scss']
})
export class SeismicComponent extends FormCommon implements OnInit, AfterViewInit {

  @HostListener('mousewheel', ['$event']) onMouseWheelChrome(event: any) {
    this.mouseWheelFunc(event);
  }

  // @HostListener('mouseover') onMouseOver(event:any) {
  //   //this.border = '5px solid green';
  // }

  // @HostListener('mousedown') onMouseDown(event:any) {
  //   console.log("Mousedown! ", event)
  //   //this.border = '5px solid green';
  // }


  private _resizeTimer: any;
  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    /*
        const hf = this.viewHeight / this.mapHeight;
        const wf = this.viewWidth / this.mapWidth;
        return Math.max(hf, wf);
    
    */
    if (this._resizeTimer) clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      const hf = this.viewHeight / this.mapHeight;
      const wf = this.viewWidth / this.mapWidth;
      this._scaleFactor = Math.max(hf, wf) * (this.customZoom ? (this.zoomCustom.width / this.zoomLimits.width) : 1);
    });
  }


  @ViewChild('wrapper') wrapper: ElementRef;
  @ViewChild('svg') svg: ElementRef;

  @Input() refLongLowerLimit: number = 118;
  @Input() refLongUpperLimit: number = 124;
  @Input() refLatLowerLimit: number = 10;
  @Input() refLatUpperLimit: number = 14;


  @Input() pxPerLong: number = 72.2;
  @Input() pxPerLat: number = 73.75;
  // @Input() pxPerLat: number = 72.2;


  @Input() firstGridLong: number = undefined;  // x pos v-line
  @Input() firstGridLat: number = undefined;   // y pos h-line

  @Input() refGridLong: number = 119;  // x pos v-line
  @Input() refGapLong: number = 1;
  @Input() refDirectionLong: string = "E";
  @Input() refGridLongPx: number = 151;  // x pos v-line

  @Input() refGridLat: number = 10;   // y pos h-line  
  @Input() refDirectionLat: string = "N";
  @Input() refGapLat: number = -1;
  @Input() refGridLatPx: number = 815;   // y pos h-line  

  // @Input() gridColor: string = 'red';
  // @Input() gridWidth: number = 2;

  @Input() gridColor: string = '#a0a0a0';
  // @Input() gridLabelColor: string = '#a0a0a0';

  // @Input() gridLabelColor: string = 'white';
  @Input() gridLabelColor: string = 'red';

  @Input() gridWidth: number = 0.5;

  public showTools: boolean = false;

  constructor(public dataSource: AppMainServiceService, public http: HttpClient) {
    super(dataSource);
  }

  get ds(): AppDataset {
    if (!this.dataSource) return null;
    return this.dataSource.ActiveSource.appDataset;
  }


  private _events: Array<TblSeismicRow> = []
  get events(): Array<TblSeismicRow> {
    return this._events;
  }

  private _eventsFiltered: Array<TblSeismicRow> = null;
  get eventsFiltered(): Array<TblSeismicRow> {
    if (this._eventsFiltered == null) {
      //this._eventsFiltered = this._events;
      return [];
    }

    return this._eventsFiltered;
  }

  get latestEvent(): TblSeismicRow {
    if (this._events.length == 0) return null;
    return this._events[0];
  }

  ngOnInit(): void {
    this.InitMap();
    // this.InitMapD3();
    // this.InitD3US();

    this.blinkPulse();

  }

  blinkPulse() {
    this.blink = !this.blink;
    setTimeout(() => this.blinkPulse(), 500);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      //const facWidth = this.wrapWidth / 
      console.log(`Wrapper: w:${this.wrapWidth}, h:${this.wrapHeight}`)
      this.handleResize(null);

      // this.InitMapD3();

    })
  }

  ToggleTools() {
    this.showTools = !this.showTools;
  }


  public dashWidth: number = 1.2;

  private _markerSize: number = 11;
  get markerSizeNative(): number {
    return this._markerSize;
  }
  @Input() markerLegendSize: number = 18;
  @Input() set markerSize(value: number) {
    this._markerSize = value;
  }
  get markerSize(): number {
    //return this._markerSize;
    // return this.wrapWidth / 50;
    return this._markerSize * this.scaleFactor;
    // return this._markerSize * this.scaleFactor;
  }

  get controlTitle(): string {
    const filter = this.activeDisplay;
    //return (this.showTools ? 'Hide' : 'Show') +' tools panel...';
    if (this.showTools) {
      return 'Hide tools panel ...';
    } else {
      return `Show tools panel ...\n\nCurrent Filter:\n${filter.label}`;
    }
  }

  get gridLabelSize(): string {
    return `${this.markerSize * 0.8}px`
  }

  private _scaleFactor: number = 1;
  get scaleFactor(): number {

    // const hf = this.viewHeight / this.mapHeight;
    // const wf = this.viewWidth / this.mapWidth;
    // return Math.max(hf, wf);

    return this._scaleFactor;
  }

  get markerSizeHalf(): number {
    return this.markerSize / 2.0
  };

  private _mapContours: Array<ICountour> = null;
  get mapContours(): Array<ICountour> {
    if (!this._mapContours) return [];
    return this._mapContours;
  }
  private _mapGridLines: Array<ICountour> = null;
  get mapGridLines(): Array<ICountour> {
    if (!this._mapGridLines) return [];
    return this._mapGridLines;
  }

  private _mapConfig: any = null;
  get mapConfig(): any {
    if (!this._mapConfig) return {};
    return this._mapConfig;
  }

  get legends(): Array<any> {
    if (!this.mapConfig) return []
    if (!this.mapConfig.legendDefinition) return [];
    return this.mapConfig.legendDefinition;
  }

  get displays(): Array<any> {
    if (!this.mapConfig) return []
    if (!this.mapConfig.displayOptions) return [];
    return this.mapConfig.displayOptions;
  }

  get gridReady(): boolean {
    // return this._longLines.length != 0;
    return this.longLines.length != 0 && this.latLines.length != 0;
  }

  private _firstGridLongCalc: number = null;
  get firstGridLongCalc(): number {
    if (this._firstGridLongCalc == null) this._firstGridLongCalc = !this.firstGridLong ? this.refGridLongPx % this.pxPerLong : this.firstGridLong;
    return this._firstGridLongCalc;
  }
  private _firstGridLatCalc: number = null;
  get firstGridLatCalc(): number {
    if (this._firstGridLatCalc == null) this._firstGridLatCalc = !this.firstGridLat ? this.refGridLatPx % this.pxPerLat : this.firstGridLat;
    return this._firstGridLatCalc;
  }

  private _firstLatCalc: number = null;
  get firstLatCalc(): number {

    if (this._firstLatCalc == null) {
      // first map latitude in 
      const px = this.firstGridLatCalc;
      const ht = this.refGridLatPx - px;
      this._firstLatCalc = this.refGridLat - (ht / this.pxPerLat) * this.refGapLat;
    }

    return this._firstLatCalc;
  }

  private _firstLongCalc: number = null;
  get firstLongCalc(): number {
    if (this._firstLongCalc == null) {
      const px = this.firstGridLongCalc;
      const wd = this.refGridLongPx - px;
      this._firstLongCalc = this.refGridLong - (wd / this.pxPerLong) * this.refGapLong;
    }

    return this._firstLongCalc;
  }


  eventClick(event: any) {
    console.log("Event: ", event);

  }


  private _longLines: Array<IGridLine> = [];
  get longLines() {
    if (this._longLines.length == 0 && this.nativeWidth != 0) {
      const firstGridLong = this.firstGridLongCalc;
      const firstLong = this.firstLongCalc;

      /**
       *       const firstGridLat = this.firstGridLatCalc;
      const firstLat = this.firstLatCalc;
       */

      const wd = this.nativeWidth - firstGridLong;
      const ret: Array<IGridLine> = [];

      const gridCountFloat = String(wd / this.pxPerLong);
      const gridCount = parseInt(gridCountFloat) + (wd % this.pxPerLong ? 1 : 0);

      for (let idx = 0; idx < gridCount; idx++) {

        ret.push({
          px: this.toFixNum(firstGridLong + idx * this.pxPerLong, 3),
          text: `${firstLong + idx * this.refGapLong} ${this.refDirectionLong}`
        })
      }
      console.log("LONG LINES: ", ret);

      this._longLines = ret;
    }
    return this._longLines
  }
  private _latLines: Array<IGridLine> = [];
  get latLines() {
    if (this._latLines.length == 0 && this.nativeHeight != 0) {
      console.log("**** 1CALC LAT/LONG : ", this.firstLatCalc, this.firstLongCalc, ", longToPx:", this.longToPx(22))

      const firstGridLat = this.firstGridLatCalc;
      const firstLat = this.firstLatCalc;

      const ht = this.nativeHeight - firstGridLat;
      const ret: Array<IGridLine> = [];

      const gridCountFloat = String(ht / this.pxPerLat);
      const gridCount = parseInt(gridCountFloat) + (ht % this.pxPerLat ? 1 : 0)

      // get initial latitude text

      for (let idx = 0; idx < gridCount; idx++) {
        ret.push({ px: this.toFixNum(firstGridLat + idx * this.pxPerLat, 3), text: `${firstLat + idx * this.refGapLat} ${this.refDirectionLat}` })
      }

      console.log("LAT LINES: ", ret);

      this._latLines = ret;
    }
    return this._latLines;

    /**
     * <line *ngIf="path.y != undefined" fill="none" [attr.stroke]="path.strokeColor ? path.strokeColor : 'black'"
                [attr.stroke-width]="path.strokeWidth ? path.strokeWidth : 1" [attr.x1]="0" [attr.y1]="path.y"
                [attr.x2]="nativeWidth" [attr.y2]="path.y" stroke-linecap="round" stroke-linejoin="round"
                stroke-miterlimit="10" />
     */
  }

  get showMap(): boolean {
    return this._mapConfig == null || this._mapContours == null ? false : true;
  }


  get viewBox(): string {
    return `${this.viewLeft} ${this.viewTop} ${this.viewWidth} ${this.viewHeight}`;
  }
  get viewBoxCustom(): string {
    return `${this.zoomCustom.left} ${this.zoomCustom.top} ${this.zoomCustom.width} ${this.zoomCustom.height}`;
  }


  public customZoom: boolean = false;

  get viewLeft(): number {
    // return 0;
    //return 65;
    return this.zoomLimits.left;
    return 200;
  }
  get viewTop(): number {
    // return 0
    // return 510;
    return this.zoomLimits.top;
    // return this.nativeHeight/4;
  }
  get viewWidth(): number {
    // return 480;
    // return this.nativeWidth - this.viewLeft;
    return this.zoomLimits.width;
    // return this.nativeWidth * 480 / this.nativeHeight;
  }

  get viewHeight(): number {
    return this.zoomLimits.height;
    return 220;
    return this.nativeHeight - this.viewTop;
    // return this.nativeHeight/2;
  }

  get zoomLimits(): IRect {
    /**
 * 
@Input() refLongLowerLimit: number = 118;
@Input() refLongUpperLimit: number = 124;
@Input() refLatLowerLimit: number = 10;
@Input() refLatUpperLimit: number = 14;

 */

    const left = this.longToPx(this.isLongRev ? this.refLongUpperLimit : this.refLongLowerLimit);
    const top = this.latToPx(this.isLatRev ? this.refLatUpperLimit : this.refLatLowerLimit);

    const right = this.longToPx(this.isLongRev ? this.refLongLowerLimit : this.refLongUpperLimit);
    const bottom = this.latToPx(this.isLatRev ? this.refLatLowerLimit : this.refLatUpperLimit);

    /**
     *  {"top":520,"left":78.8,"width":433.2,"height":295}
     * {"top":590.4946627841089,"left":182.9183564478593,"width":225.4483934872601,"height":153.52556804880345}
     */

    // return {
    //   top: 590.4946627841089,
    //   left: 182.9183564478593,
    //   width: 225.4483934872601,
    //   height: 153.52556804880345
    // }

    return {
      top: top, left: left,
      width: right - left,
      height: bottom - top
    };
  }

  get isLatRev(): boolean {
    return this.refGapLat < 0;
  }
  get isLongRev(): boolean {
    return this.refGapLong < 0;
  }


  get zoomAll(): IRect {
    return { top: 0, left: 0, width: this.nativeWidth, height: this.nativeHeight }
  }


  private _zoomCustom: IRect = {
    top: this.zoomLimits.top, left: this.zoomLimits.left, width: this.zoomLimits.width, height: this.zoomLimits.height
  };
  get zoomCustom(): IRect {
    return this._zoomCustom;
  }


  get viewLimits(): string {

    return ``
  }



  get fullFactor(): number {
    return 1;
  };
  get mapWidth(): number {
    // return this.nativeWidth;

    // return this.nativeWidth * this.fullFactor;

    // return this.viewWidth

    // return Math.max(this.wrapWidth,this.viewWidth);

    return this.wrapWidth;
  }
  get mapHeight(): number {
    //  return this.nativeHeight;
    // return this.nativeHeight * this.fullFactor;

    // return Math.max(this.wrapHeight,this.viewHeight);
    return this.wrapHeight;
  }

  get nativeWidth(): number {
    return this._mapConfig ? +this._mapConfig.nativeWidth : 0;
  }

  get nativeHeight(): number {
    return this._mapConfig ? +this._mapConfig.nativeHeight : 0;
  }

  get wrapWidth(): number {
    if (!this.wrapper) return 0;
    return this.wrapper.nativeElement.offsetWidth;
  }
  get wrapHeight(): number {
    if (!this.wrapper) return 0;
    return this.wrapper.nativeElement.offsetHeight;
  }

  get debugMessage(): string {
    return `viewBox: ${this.viewBox}, viewBoxCustom: ${this.viewBoxCustom}, zoomLimits: ${JSON.stringify(this.zoomLimits)}, zoomCustom: ${JSON.stringify(this.zoomCustom)}, nativeWidth: ${JSON.stringify(this.nativeWidth)}, nativeWidth: ${this.nativeWidth}, nativeHeight: ${this.nativeHeight}, mapWidth: ${this.mapWidth}, mapHeight: ${this.mapHeight}, x: ${this.svgToScreen({ x: 200, y: 700 }, { width: 10, height: 10 }).x}`
  }


  private _maskPrompt: string = 'MAP'
  get maskPrompt(): string {
    switch (this._maskPrompt) {
      case 'MAP':
        return 'Loading seismic map. Please wait...'
      case 'EVT':
        return 'Loading seismic events. Please wait...'
      default:
        return 'Loading data. Please wait...'
    }
  }

  get activeDisplay(): any {
    return this.displays.find(d => d.active)
  }

  private _loadingData: boolean = true;
  get loadingData(): boolean {
    return this._loadingData;
  }

  public width: number = 900;
  public height: number = 600;

  DisplaySelect(display: any) {

    const active = this.activeDisplay;
    if (active) active.active = false;
    display.active = true;

    const { code } = display;

    this.filterEvents(code);
    this.ToggleTools();

  }

  filterEvents(code: string) {

    if (code == 'ALL') {
      this._eventsFiltered = this.events;
    } else {
      let days = 0;
      const fcode = code.substring(0, 2);
      const cnt = +code.substring(2);

      const ret: Array<TblSeismicRow> = []
      switch (fcode) {
        case 'LE':
          // this._eventsFiltered
          for (let i = 0; i < cnt; i++) {
            const evt = this.events[i];
            ret.push(evt);
          }
          console.log("FltEvents: ", ret, ret[0].SIS_TIME, ret[0].SIS_DATE);
          this._eventsFiltered = ret;
          break;
        case 'WK':
          days = 7 * cnt;
          break;
        case 'MO':
          days = 30 * cnt;
          break;
        case 'YR':
          days = 365.25 * cnt;
          break;
        default:
      }

      if (days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        this._eventsFiltered = this.events.filter(evt => evt.XTRA.stamp >= date);
      }

    }
  }

  mouseWheelFunc(event: any) {
    if (event.deltaY < 0) {
      this._zoomCustom.width = this._zoomCustom.width * 0.95
      this._zoomCustom.height = this._zoomCustom.height * 0.95
    } else {
      this._zoomCustom.width = Math.min(this._zoomCustom.width * 1.05, this.zoomLimits.width)
      this._zoomCustom.height = Math.min(this._zoomCustom.height * 1.05, this.zoomLimits.height)
    }

    this.customZoom = true;

    const { layerX, layerY } = event;
    const cp = this.screenToSVG({ x: layerX, y: layerY })

    const ratioX = (cp.x - this.viewLeft) / this.viewWidth;
    const ratioY = (cp.y - this.viewTop) / this.viewHeight;

    this._zoomCustom.top = cp.y - this._zoomCustom.height * ratioY;
    this._zoomCustom.left = cp.x - this._zoomCustom.width * ratioX;

    // console.log(`LayerX: ${layerX}, LayerY: ${layerY}, svgX: ${cp.x}, svgY: ${cp.y}`)
    this.handleResize(null);
  }

  dotHREF(event: TblSeismicRow): string {
    const { SIS_MAG } = event
    if (SIS_MAG > 5) {
      return '#dotv';
    } else {
      return '#dotg';
    }
  }

  toFixNum(num: any, places?: number) {
    if (places == undefined) places = 2;
    return parseFloat((num).toFixed(places))
  }

  longToPx(long: number): number {
    // NS
    const pxFirst = this.firstGridLongCalc;
    return pxFirst + this.pxPerLong * (long - this.firstLongCalc) * (this.refGapLong < 0 ? -1 : 1);
  }
  latToPx(lat: number): number {
    // EW
    const pxFirst = this.firstGridLatCalc;
    return pxFirst + this.pxPerLat * (lat - this.firstLatCalc) * (this.refGapLat < 0 ? -1 : 1);
  }

  longDMSToPx(dms: string): number {
    return this.longToPx(this.dmsToDec(dms));
  }
  latDMSToPx(dms: string): number {
    return this.latToPx(this.dmsToDec(dms));
  }

  DMSToMarker(dms: string, isLat?: boolean): number {
    const dmsVal = isLat ? this.latDMSToPx(dms) : this.longDMSToPx(dms)
    return dmsVal + this.markerSize / 2;

    // return 100;
  }

  dmsToDec(dms: string): number {
    // 14 Deg 12 Mins 50 Secs
    const dmsArr = dms.replace(/  /gi, ' ').split(' ');
    return parseInt(dmsArr[0]) + parseInt(dmsArr[2]) / 60 + parseInt(dmsArr[4]) / 3600
  }

  InitD3US() {
    // const width = 900;
    // const height = 600;
    // const svg = d3.select("body").append("svg")
    //     .attr("width", width)
    //     .attr("height", height);

    // const projection = d3.geoAlbersUsa()
    //     .translate([width / 2, height / 2]) // translate to center of screen
    //     .scale(1000); // scale things down so see entire US

    // const path = d3.geoPath().projection(projection);

    // d3.json('https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json')
    //   .then(data=>{
    //     svg.selectAll('path')
    //     .data(uState.features)
    //     .enter()
    //     .append('path')
    //     .attr("d", path)

    //   });


  }

  InitMapD3() {
    const width = 1366;
    const height = 800;

    // const svg = d3.select('body').append('svg').attr('width', width).attr('height', height);
    // const svg = d3.select('#map_svg');

    const svg = d3.select('#map_wrapper').select('svg');

    // const svg = d3.select('#map_wrapper').html('<svg width="900" height="600"></svg>').select('svg');
    // const svg = d3.select('#map_wrapper').html('<svg width="900" height="600"></svg>').select('svg');
    // d3.select('#map_wrapper').html('<svg></svg>')

    console.log("SVG:", svg);

    // const projection = d3.geoMercator().scale(140).translate([width / 2, height / 1.4]);
    // const projection = d3.geoAlbersUsa()
    // .translate([width / 2, height / 2]) // translate to center of screen
    // .scale([1000]);

    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2]) // translate to center of screen
      .scale(1000);

    const path = d3.geoPath(projection);

    const g = svg.append('g');

    //worldmap.json
    // d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    //"https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json
    // d3.json('./assets/seismic/provinces.json?v=1').then(data=>{
    d3.json('https://gist.githubusercontent.com/Bradleykingz/3aa5206b6819a3c38b5d73cb814ed470/raw/a476b9098ba0244718b496697c5b350460d32f99/us-states.json').then(data => {
      console.log("DATA: ", data);

      const result: any = data;

      // const paths:any = topojson.feature(result, result.objects);
      const paths: any = d3.geoPath().projection(projection);
      // const countries:any = topojson.feature(result, result.features);

      // console.log("G: ",g, countries,path)

      g.selectAll('path').data(paths.features).enter()
        .append('path').attr('class', 'country').attr('d', path);

    })


    // return new Promise<void>((resolve, reject) => {
    //   ////do your initialisation stuff here
    //   const path = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    //   // const path = './assets/seismic/worldmap.json';

    //   const subs = this.http.get(path).subscribe(
    //     (result: any) => {
    //       console.log('\nSEISMIC SUCCESS RESULT', result);

    //       // this._mapConfig = result.config;
    //       // this._mapContours = result.data;

    //       const countries: any = topojson.feature(result, result.objects.countries);
    //       g.selectAll('path').data(countries.features).enter().append('path').attr('class', 'country').attr('d', path);

    //       resolve();
    //       subs.unsubscribe();
    //     },
    //     (error) => {
    //       console.log('\nERROR RESULT', error);

    //       subs.unsubscribe();
    //       reject(error);
    //     }
    //   );
    // }).catch((err) => {
    //   console.log('\nERROR RESULT err', err);
    // });

    // d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    //   .then(data => {

    //     const countries = t.feature(data, data.objects.countries);
    //     g.selectAll('path').data(countries.features).enter().append('path').attr('class', 'country').attr('d', path);

    //   });
  }

  ZoomLimits() {
    this.customZoom = false;
    this.zoomCustom.top = this.zoomLimits.top;
    this.zoomCustom.left = this.zoomLimits.left;
    this.zoomCustom.width = this.zoomLimits.width;
    this.zoomCustom.height = this.zoomLimits.height;
    this.handleResize(null);
  }

  InitMap() {

    return new Promise<void>((resolve, reject) => {
      ////do your initialisation stuff here
      const path = './assets/seismic/seismicmap.json';
      const subs = this.http.get(path).subscribe(
        (result: any) => {

          console.log('\nSEISMIC SUCCESS RESULT', result);

          this._mapConfig = result.config;
          this._mapContours = result.data.filter(item => !item.isGrid);
          this._mapGridLines = result.data.filter(item => item.isGrid);

          resolve();
          subs.unsubscribe();


          // get Actual Data....
          this._maskPrompt = 'EVT';
          const params: Array<RequestParams> = [{
            code: 'sis',
            filter: `{SIS_LONG|gte|${this.refLongLowerLimit}}^{SIS_LONG|lte|${this.refLongUpperLimit}}^{SIS_LAT|gte|${this.refLatLowerLimit}}^{SIS_LAT|lte|${this.refLatUpperLimit}}`,
            includedFields: 'SIS_REFNO`SIS_LATDMS`SIS_LONGDMS`SIS_NEARESTASSET`SIS_NEARESTKP`SIS_DISTFRMASSET`SIS_DATE`SIS_TIME`SIS_N`SIS_E`SIS_HREF`SIS_MAG`SIS_DEPTH`SIS_TRIGGERCLASS`SIS_TITLE`SIS_PUBLISHED_DATE`SIS_SOURCE',
            sortFields: '-SIS_DATE,-SIS_TIME',
            snapshot: true
          }]


          const sdata = this.ds.Get(params, {
            onSuccess: (data) => {
              console.log("SEISMIC DATA: ", data);

              this._events = data.processed.data[0];
              data.processed.data[0].forEach((event: TblSeismicRow) => {
                // set longpx and latpx for each event
                event.XTRA = { long: this.DMSToMarker(event.SIS_LONGDMS), lat: this.DMSToMarker(event.SIS_LATDMS, true), stamp: this.EventDateAndTime(event) }
              });

              const active = this.activeDisplay;
              if (active) this.filterEvents(active.code);
              this._loadingData = false;
            },
            onError: (err) => {
              this._maskPrompt = 'Error: ' + err.message;
            }
          })


        },
        (error) => {
          console.log('\nERROR RESULT', error);

          subs.unsubscribe();
          reject(error);
        }
      );
    }).catch((err) => {
      console.log('\nERROR RESULT err', err);
    });

  }

  EventDateAndTime(event: TblSeismicRow): Date {
    return new Date(String(event.SIS_DATE).split("T")[0] + 'T' + String(event.SIS_TIME).split("T")[1]);
  }

  ctrType(contour: ICountour): string {
    return contour.type ? contour.type : 'path';
  }

  isPath(contour: ICountour): boolean {
    return this.ctrType(contour) == SVG_TYPE.PATH;
  }
  isRect(contour: ICountour) {
    return this.ctrType(contour) == SVG_TYPE.RECTANGLE;
  }
  isLine(contour: ICountour) {
    return this.ctrType(contour) == SVG_TYPE.LINE;
  }
  isPoly(contour: ICountour) {
    return this.ctrType(contour) == SVG_TYPE.POLYLINE;
  }

  screenToSVG(point: IPoint, marker?: IRectSize) {
    const { x, y } = point;
    const { ratio, viewOffsetX, viewOffsetY } = this.transPoint;

    const markerWidth = marker ? marker.width : 0;
    const markerHeight = marker ? marker.height : 0;

    return { x: ratio * (x + markerWidth / 2) + viewOffsetX, y: ratio * (y + markerWidth / 2) + viewOffsetY };
  }

  svgToScreen(point: IPoint, marker?: IRectSize): IPoint {
    const { x, y } = point;
    const { ratio, viewOffsetX, viewOffsetY } = this.transPoint;

    const markerWidth = marker ? marker.width : 0;
    const markerHeight = marker ? marker.height : 0;

    return { x: (x - viewOffsetX) / ratio - markerWidth / 2, y: (y - viewOffsetY) / ratio - markerHeight / 2 };

  }

  EventTitle(event: TblSeismicRow): string {
    const { XTRA, SIS_LATDMS, SIS_LONGDMS, SIS_TITLE, SIS_TRIGGERCLASS, SIS_MAG, SIS_N, SIS_E, SIS_DATE, SIS_TIME, SIS_NEARESTASSET, SIS_NEARESTKP, SIS_DISTFRMASSET, SIS_DEPTH, SIS_SOURCE, SIS_PUBLISHED_DATE } = event;
    const s = (n: number) => { return ' '.repeat(n) }
    const title = SIS_TITLE ? SIS_TITLE : `M${SIS_MAG} - ${SIS_NEARESTASSET}(nearest asset)`;
    return `${title}
${'-'.repeat(75)}
Trigger class${s(7)} ${SIS_TRIGGERCLASS}
Nearest Asset${s(5)} ${SIS_NEARESTASSET}
Nearest kp${s(10)} ${SIS_NEARESTKP}
Long / Lat${s(11)} ${this.dmsToDec(SIS_LONGDMS).toFixed(4)}E / ${this.dmsToDec(SIS_LATDMS).toFixed(4)}N
Depth${s(17)} ${SIS_DEPTH}km
Source${s(17)} ${SIS_SOURCE}
Publish Date${s(8)} ${SIS_PUBLISHED_DATE}
`
  }

  public blink: boolean = true;

  get transPoint(): ITransPoint {

    const viewTop = this.customZoom ? this.zoomCustom.top : this.viewTop;
    const viewLeft = this.customZoom ? this.zoomCustom.left : this.viewLeft;
    const viewWidth = this.customZoom ? this.zoomCustom.width : this.viewWidth;
    const viewHeight = this.customZoom ? this.zoomCustom.height : this.viewHeight;

    const scrWidth = this.mapWidth;
    const scrHeight = this.mapHeight;

    const maxRatio = Math.max(viewWidth / scrWidth, viewHeight / scrHeight);

    const viewWidthCalc = scrWidth * maxRatio;
    const viewHeightCalc = scrHeight * maxRatio;

    const viewOffsetX = viewLeft - (viewWidthCalc - viewWidth) / 2;
    const viewOffsetY = viewTop - (viewHeightCalc - viewHeight) / 2;

    return { ratio: maxRatio, viewOffsetX: viewOffsetX, viewOffsetY: viewOffsetY };
  }

  private mouseDown: boolean = false;
  private mouseMoved: boolean = false;
  private mousePointRef: IPoint = null;

  MouseEvent(event: any) {
    const { layerX, layerY } = event;
    switch (event.type) {
      case 'mousedown':
        this.mouseDown = true;
        this.mousePointRef = { x: layerX, y: layerY }
        break;
      case 'mouseup':

        this.mouseDown = false;
        this.mousePointRef = null;
        break;
      case 'mouseout':
      case 'mousemove':
        if (this.mouseDown && this.customZoom) {
          const offX = this.mousePointRef.x - layerX;
          const offY = this.mousePointRef.y - layerY;

          const { left, top } = this.zoomCustom;

          const cp = this.screenToSVG({ x: layerX, y: layerY })
          const oldScreenOrigin = this.svgToScreen({ x: left, y: top });
          const newOrigin = this.screenToSVG({ x: oldScreenOrigin.x + offX, y: oldScreenOrigin.y + offY });

          this.zoomCustom.left = Math.max(newOrigin.x, this.zoomLimits.left);
          this.zoomCustom.top = Math.max(newOrigin.y, this.zoomLimits.top);

          this.mousePointRef.x = layerX;
          this.mousePointRef.y = layerY;

          // console.log(`NewOrigin: ${JSON.stringify(newOrigin)}`);

          // console.log(`LayerX ${layerX}, LayerY ${layerY}, offX: ${offX}, offY: ${offY}, cpx: ${cp.x}, cpy: ${cp.y}`);
        }
        break;
    }
  }

}

export interface ITransPoint {
  viewOffsetX: number;
  viewOffsetY: number;
  ratio: number;
}

export interface ICountour {
  id: string;         // id
  title: string;      // title
  d?: string;          // path
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  type?: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  points?: string;
}
export interface IGridLine {
  text: string;      // title
  px: number;
}

export interface IRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IRectSize {
  width: number;
  height: number;
}



export enum SVG_TYPE {
  PATH = 'path',
  RECTANGLE = 'rect',
  LINE = 'line',
  CIRCLE = 'circle',
  POLYLINE = 'polyline',
}
