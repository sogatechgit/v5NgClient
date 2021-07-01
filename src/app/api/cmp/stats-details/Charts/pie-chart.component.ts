import { Component, OnInit, ElementRef, ViewChild, Input, HostListener, AfterViewInit } from '@angular/core';
import { ChartType, ChartOptions, PositionType } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit, AfterViewInit {

  @Input() set title(value: string){
    this.pieChartOptions.title.text = value;
  }
  @Input() set titlePosition(value: PositionType){
    this.pieChartOptions.title.position = value;
  }
  @Input() titleAlign:string='left'

  @Input() textColor:string = 'gray';
  @Input() fontFamily:string = 'Futura-Book';
  @Input() titleSize:number = 16;
  @Input() legendSize:number = 14;
  

  @Input() legendPosition: PositionType = 'right';

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    // simply adding this event declaration, triggers recalculation of column widths
    // when the browser window is resized!
    // a method can also be called within this event handler...
    // this.RefreshGridDisplay();
    if (this.elRef && this.canvas) {
      const parElem = this.elRef.nativeElement.parentElement;

      if (this.name == 'ch1') {
        console.log("PARENT ELEMENT: ", parElem.clientWidth, parElem.clientHeight);
      }

      const ctx = this.canvas.nativeElement.getContext("2d");
      const width = parElem.clientWidth;
      const height = parElem.clientHeight;

      if (window.devicePixelRatio) {

        // ctx.canvas.style.backgroundColor = 'cyan';
        ctx.canvas.style.width = width + "px";
        ctx.canvas.style.height = height + "px";
        ctx.canvas.height = height * window.devicePixelRatio;
        ctx.canvas.width = width * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        if (this._visibility != 'visible') {
          setTimeout(() => {
            this._visibility = 'visible';
          }, 50)

        }

        if (this.chart) this.chart.chart.update();
      }

    }
  }

  @Input() name: string;

  @Input() set seriesTitles(value:Label[]){
    this.pieChartLabels = value;
  }
  get seriesTitles():Label[]{
    return this.pieChartLabels;
  }

  @Input() set seriesData(value:SingleDataSet){
    this.pieChartData = value;
  }
  get seriesData():SingleDataSet{
    return this.pieChartData;
  }

  @ViewChild('canvas') canvas: ElementRef;

  private _visibility: string = 'visible';
  get visibility(): string {
    return this._visibility;
  }

  // Pie
  public pieChartOptions: ChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    legend: {
      labels: {
        fontColor: this.textColor,
        fontFamily:this.fontFamily,
        fontSize:this.legendSize
      },
      position: this.legendPosition,
      
    },
    title: {
      fontFamily:this.fontFamily,
      fontSize: this.titleSize,
      display: true,
      fontColor:this.textColor,
      position: 'top',
      text:'Pie Chart Title'
      
    }
  };
  // for multi-line legends, supply array of strings for each data sector
  // public pieChartLabels: Label[] = [['Download', 'Sales'], ['In', 'Store', 'Sales'], 'Mail Sales'];
  public pieChartLabels: Label[];
  public pieChartData: SingleDataSet;
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor(private elRef: ElementRef) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
    console.log("@@@@@@@@@@ PIE Params: ",this.seriesData, this.seriesTitles)
    this.handleResize(null);
  }

}
