import { Component, OnInit, ElementRef, HostListener, ViewChild, Input, AfterViewInit } from '@angular/core';
import * as Chart from 'chart.js';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { BaseChartDirective, Label } from 'ng2-charts';


@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, AfterViewInit {
  @Input() name: string;

  private _data: any = {};
  @Input() set data(value: any) {
    // expected entries
    /**
     * barChartLabels
     * barChartData
     * barChartLegend
     * 
     */
    console.log("DATA VAlue: ", value)

    for (const key in value) {
      this._data[key] = value[key];
    }

    const { barChartTitle,
      barChartLabels, 
      barChartData, 
      barChartLegend, 
      verticalGrid, 
      yAxisTitle, 
      xAxisTitle, 
      legendPosition } = this.data;

    if (barChartData.length == 1) {
      // no legend
      // single dataset
      // multiple value dataset
      // barChartLabels taken from 
      this.data.barChartLegend = false;
    } else {
      this.data.barChartLegend = true;
    }

    this.chartObject.options.title.text = barChartTitle;
    this.chartObject.options.title.fontSize = 12;

    this.chartObject.options.legend.labels.fontSize = 10;

    this.chartObject.options.legend.display = this.data.barChartLegend;
    this.chartObject.data.datasets = barChartData;

    const withXLabels = (barChartLabels && barChartLabels.length);

    this.chartObject.data.labels = withXLabels ? barChartLabels : [];
    this.chartObject.options.scales.xAxes[0].ticks.display = withXLabels;

    if (legendPosition) this.chartObject.options.legend.position = legendPosition;

    //this.chartObject.options.scales[1].title = 'hello title'
    // console.log("this.chartObject.options: ", this.chartObject.options);

    this.chartObject.options.scales.xAxes[0].gridLines.display = verticalGrid ? true : false;

    if (yAxisTitle) {
      this.chartObject.options.scales.yAxes[0].scaleLabel.display = true;
      this.chartObject.options.scales.yAxes[0].scaleLabel.labelString = yAxisTitle
      this.chartObject.options.scales.yAxes[0].scaleLabel.fontSize = 10;
    } else {
      this.chartObject.options.scales.yAxes[0].scaleLabel.display = false;
    }
    if (xAxisTitle) {
      this.chartObject.options.scales.xAxes[0].scaleLabel.display = true;
      this.chartObject.options.scales.xAxes[0].scaleLabel.labelString = xAxisTitle
      this.chartObject.options.scales.xAxes[0].scaleLabel.fontSize = 10;
    } else {
      this.chartObject.options.scales.xAxes[0].scaleLabel.display = false;
    }


    // this.chartObject.options.plugins = {
    //   datalabels: {
    //     // backgroundColor: function(context) {
    //     //   return context.dataset.backgroundColor;
    //     // },
    //     borderRadius: 4,
    //     color: 'white',
    //     font: {
    //       weight: 'bold'
    //     },
    //     formatter: Math.round,
    //     padding: 6
    //   }
    // }

    this.update();
  }
  get data() {
    return this._data;
  }

  @Input() set title(value: string) {
    this.barChartOptions.title.text = value ? value : 'Bar Chart';
  }

  @ViewChild('canvas') canvas: ElementRef;

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    // simply adding this event declaration, triggers recalculation of column widths
    // when the browser window is resized!
    // a method can also be called within this event handler...
    // this.RefreshGridDisplay();
    if (this.elRef && this.canvas) {
      const parElem = this.elRef.nativeElement.parentElement;

      if (this.name == 'ch2') {
        // console.log("PARENT ELEMENT: ", parElem.clientWidth, parElem.clientHeight);
      }

      const ctx = this.canvas.nativeElement.getContext("2d");
      const width = parElem.clientWidth;
      const height = parElem.clientHeight;

      // parElem.style.backgroundColor = 'olive';

      if (window.devicePixelRatio) {

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


  private _visibility: string = 'hidden';
  get visibility(): string {
    return this._visibility;
  }

  public barChartOptions: ChartOptions = {
    // animation:ChartAnimationOptions
    maintainAspectRatio: false,
    responsive: true,
    title: {
      display: true,
      text: 'Sample Bar Chart',
      fontSize: 14,
      position: 'top'
    },
    legend: {
      position: 'right',
    },
    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            // min: 0,
            // max: 6,
            fontSize: 10,
            stepSize: 1,
          },
          gridLines: {
            offsetGridLines: false,
          },
        }
      ],
      xAxes: [
        { 
          gridLines: { display: false },
          ticks:{
            fontSize: 10,
            padding:0
          }

        }
      ]
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color:'white',
        padding:1,
        textShadowBlur:15,
        textShadowColor:'black'
        // textShadowBlur:function(context){
        //   const index = context.dataIndex;
        //   const value = context.dataset.data[index];
        //   return 12;
        // },
        // textShadowColor:function(context){
        //   const index = context.dataIndex;
        //   const value = context.dataset.data[index];
        //   return 'black';
        // },
        // backgroundColor: function (context) {
        //   const index = context.dataIndex;
        //   const value = context.dataset.data[index];

        //   return value ? null : 'black';
        // }
      }
    }
  };
  public barChartLabels: Label[] = ['series 1', 'series 2', 'series 3'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[] = [
    // { data: [0, 0, 0], backgroundColor: ['red', 'green', 'puple'] },
    { data: [4, 12, 8], backgroundColor: ['#c0c0c0', '#c0c0c0', '#c0c0c0'] },
    // { data: [25, 15], backgroundColor: 'green' }
  ];

  constructor(private elRef: ElementRef) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.handleResize(null);

    // this.chart.chart.data = {
    //   labels:['Raised','Closed'],
    //   datasets:[{
    //     label:
    //   }]

    // }
    //this.chart.chart.data.datasets[1].label = 'HELLO'
  }

  get chartObject(): Chart {
    return this.chart.chart
  }

  update() {
    // this.chartObject.options.legend.labels.usePointStyle = false;
    console.log("CAhrt Update: ", this.data, this.chartObject);
    this.chartObject.update();
  }
}
