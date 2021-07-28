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
  @Input() maxYStep: number = 8;

  private _data: any = {};
  @Input() set data(value: any) {
    // expected entries
    /**
     * barChartLabels
     * barChartData
     * barChartLegend
     * 
     */
    console.log("Bar chart data: ",value)


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
            fontSize: 9,
            stepSize: 2,
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
            fontSize: 9,
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
        // padding:function(context){
        //   const index = context.dataIndex;
        //   const value = context.dataset.data[index];
        //   return value ? 1 : 3;
        // },
        textShadowBlur:15,
        textShadowColor:'black',
        backgroundColor: function (context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          // const bg = String(context.dataset.backgroundColor);

          return value ? null : 'gray';
        }
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
    setTimeout(()=>this.handleResize(null));
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
