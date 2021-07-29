import { Component, OnInit, ViewChild, Input, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Color, Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';


@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})


export class LineChartComponent implements OnInit, AfterViewInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('canvasContainer') canvasContainer: ElementRef;

  private _oldWidth: number;
  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    // return;

    if (!this.canvasContainer) {
      console.log("canvasContainer not found!")
      return;
    }
    const contParent = this.canvasContainer.nativeElement.parentElement;

    const contParentRect = contParent.getBoundingClientRect();
    const { width, height } = contParentRect;  // get parent container width and height

    const contRect = this.canvasContainer.nativeElement.getBoundingClientRect();

    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    const aspect = canvasRect.width / canvasRect.height;

    let newHeight = width / aspect;

    const newWidth = newHeight > height ? height * aspect : width;
    if (newHeight > height) newHeight = height;

    this.canvasContainer.nativeElement.style.width = newWidth + 'px';
    this.canvasContainer.nativeElement.style.height = newHeight + 'px';

    //console.log(`width:${width}, height:${height}, aspect:${aspect}, newHeight:${newHeight}`);



    // const overflow = contRect.height < canvasRect.height;


    // if(overflow){
    //   const absWidth = aspect * contRect.height
    //   console.log(canvasRect.height, contRect.height,contRect.height < canvasRect.height, aspect);
    // }

    return;
    // simply adding this event declaration, triggers recalculation of column widths
    // when the browser window is resized!
    // a method can also be called within this event handler...
    // this.RefreshGridDisplay();

    if (this.elRef && this.canvas) {
      const parElem = this.elRef.nativeElement.parentElement;

      const ctx = this.canvas.nativeElement.getContext("2d");
      const parWidth = parElem.clientWidth;
      const parHeight = parElem.clientHeight;


      // parElem.style.backgroundColor = 'olive';
      const pxr = window.devicePixelRatio;
      const { width, height } = ctx.canvas;


      if (pxr) {

        // if(ctx.canvas.height  < height * window.devicePixelRatio){

        let tempWidth = parWidth * 0.5;
        let tempHeight = parHeight;

        ctx.canvas.style.width = tempWidth + "px";
        //ctx.canvas.style.height = tempHeight + "px";
        // ctx.canvas.style.height =  height + "px";

        // ctx.canvas.height = height * window.devicePixelRatio;
        ctx.canvas.width = tempWidth * pxr;
        //ctx.canvas.height = tempHeight * pxr;

        // this._oldWidth = width;
        // }else{
        //   ctx.canvas.style.width =  this._oldWidth + "px";
        //   ctx.canvas.width = this._oldWidth * window.devicePixelRatio;
        // }


        // ctx.scale(pxr, pxr);

        // if (this._visibility != 'visible') {
        //   setTimeout(() => {
        //     this._visibility = 'visible';
        //   }, 50)

        // }

        console.log(`${parWidth}:${width}, ${parHeight}:${height}:${ctx.canvas.height}`)

        if (this.chart) this.update();


      }

    }
  }


  @Input() name: string;
  @Input() title: string;
  @Input() maxYStep: number = 10;

  private _data: any = {};
  @Input() set data(value: any) {
    console.log("Line chart data: ", value)


    for (const key in value) {
      this._data[key] = value[key];
    }

    const opts: ChartOptions = this.chartObject.options;

    const { chartTitle,
      chartLabels,
      chartData,
      chartLegend,
      verticalGrid,
      yAxisTitle,
      xAxisTitle,
      legendPosition } = this.data;

    if (chartData.length == 1) {
      // no legend
      // single dataset
      // multiple value dataset
      // barChartLabels taken from 
      this.data.chartLegend = false;
    } else {
      this.data.chartLegend = true;
    }

    opts.title.display = chartTitle ? true : false;
    opts.title.text = chartTitle;
    opts.title.fontSize = 12;

    opts.legend.labels.fontSize = 10;

    opts.legend.display = this.data.chartLegend;
    this.chartObject.data.datasets = chartData;

    this._maxData = 0;
    chartData.forEach(dset => {
      dset.data.forEach(dat => {
        if (dat > this._maxData) this._maxData = dat;
      })
    })

    const withXLabels = (chartLabels && chartLabels.length);

    this.chartObject.data.labels = withXLabels ? chartLabels : [];

    const { scales, legend } = opts;
    opts.scales.xAxes[0].ticks.display = withXLabels;

    if (legendPosition) opts.legend.position = legendPosition;

    scales.xAxes[0].gridLines.display = verticalGrid ? true : false;

    if (yAxisTitle) {
      scales.yAxes[0].scaleLabel.display = true;
      scales.yAxes[0].scaleLabel.labelString = yAxisTitle
      scales.yAxes[0].scaleLabel.fontSize = 10;
    } else {
      opts.scales.yAxes[0].scaleLabel.display = false;
    }
    if (xAxisTitle) {
      scales.xAxes[0].scaleLabel.display = true;
      scales.xAxes[0].scaleLabel.labelString = xAxisTitle
      scales.xAxes[0].scaleLabel.fontSize = 10;
    } else {
      scales.xAxes[0].scaleLabel.display = false;
    }


    legend.labels.usePointStyle = true;

    //console.log("maxData: ", this.maxData)
    // change y axis step
    const steps = this.maxYStep;
    const maxData = this.maxData;
    const yA = scales.yAxes[0];

    const rem = maxData % steps;
    const intVal = (maxData - rem) / steps;

    //const newSteps = maxData <= steps ? 1 : 
    console.log(`${rem}, ${steps}, ${rem / steps}`)
    if (intVal) {
      yA.ticks.stepSize = intVal + ((rem / steps) < 0.5 ? 0 : 1);
    } else {
      yA.ticks.stepSize = 1;
    }

    this.update();

  }

  private _maxData: number = 0;
  get maxData(): number {
    return this._maxData;
  }

  get data() {
    return this._data;
  }

  private _visibility: string = 'hidden';
  get visibility(): string {
    return this._visibility;
  }


  // example
  // chObj.data = {
  //   barChartTitle: 'Multi Dataset Multi Value Bar Chart',
  //   barChartLabels: ['2019', '2020', '2021'],
  //   barChartData: [
  //     { data: [2, 6, 5], label: 'Raised', backgroundColor: this.SeriesColor('Raised') },
  //     { data: [5, 8, 7], label: 'Closed', backgroundColor: this.SeriesColor('Closed') }
  //   ]
  // }         

  public lineChartData: ChartDataSets[] = [
    { data: [8, 1, 0], label: 'Raised' },
    { data: [12, 12, 20], label: 'Closed' },
  ];
  // public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartLabels: Label[] = ['2021', '2020', '2019'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
          // min: 0,
          // max: 6,
          fontSize: 9,
          // stepSize: 2,
        },
        gridLines: {
          offsetGridLines: false,
        },
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        font: {
          size: 9,
        },

        align: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];

          // if(value){
          //   if(this)console.log("MaxData: ",this._maxData)
          //   return 'end'
          // }else{
          //   return 'end'
          // }
          return value ? 'start' : 'end';
        },
        color: '#111111',
        padding: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value ? 1 : 0;
        },
        textShadowBlur: 25,
        textShadowColor: 'white',
        textStrokeWidth: 0.25,
        textStrokeColor: 'gray',
        backgroundColor:'white'
        // ,
        // backgroundColor: function (context) {
        //   const index = context.dataIndex;
        //   const value = context.dataset.data[index];
        //   // const bg = String(context.dataset.backgroundColor);

        //   return value ? null : 'gray';
        // }
      }
    }
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,0,0,0.0)'
      //backgroundColor:'white'
      // backgroundColor: 'rgba(255,0,0,0.3)',
      // backgroundColor: null,
    },
    {
      borderColor: 'red',
      backgroundColor: 'rgba(255,0,0,0.0)'
      // backgroundColor: 'rgba(255,0,0,0.3)',
      // backgroundColor: null,
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginDataLabels];

  constructor(private elRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    //setTimeout(()=>{this.handleResize(null)},2000)
    setTimeout(()=>{
      this.handleResize(null);
      // this.update();
    },10)
  }

  get chartObject(): Chart {
    return this.chart.chart
  }

  formatCanvas() {
    const canvas = this.canvas.nativeElement;
    canvas.width = 800;
    // canvas.height = 300;
    var context = canvas.getContext('2d');
    // context.fillStyle = "black";
    // context.font = "50px Arial";
    // context.fillText('ASD', 0, 50);
    // context.globalCompositeOperation = "destination-over";
    // context.fillStyle = "#00FFFF";
    // context.fillRect(0, 0, canvas.width, canvas.height);//for white background
    context.globalCompositeOperation = "source-over";
    // context.lineWidth = 2;
    context.strokeStyle = "#FF0000";
    context.strokeRect(0, 0, canvas.width, canvas.height);//for white background
  }

  update() {
    this.chartObject.update();
    // setTimeout(()=>{
    //   this.formatCanvas();
    //   console.log("UPDATE CANVAS ...")
    // },2000)
  }

}
