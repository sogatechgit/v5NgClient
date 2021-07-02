import { Component, OnInit, ElementRef, HostListener, ViewChild, Input, AfterViewInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { BaseChartDirective, Label } from 'ng2-charts';


@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, AfterViewInit {
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

      if (window.devicePixelRatio) {

        ctx.canvas.style.width = width + "px";
        ctx.canvas.style.height = height + "px";
        ctx.canvas.height = height * window.devicePixelRatio;
        ctx.canvas.width = width * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        if (this._visibility != 'visible') {
          setTimeout(() => {
            this._visibility = 'visible';
          },50)

        }

        if (this.chart) this.chart.chart.update();
      }

    }
  }

  @Input() name: string;

  @ViewChild('canvas') canvas: ElementRef;

  private _visibility: string = 'hidden';
  get visibility(): string {
    return this._visibility;
  }


  public barChartOptions: ChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    title: {
      display: true,
      text: 'Sample Bar Chart',
      fontSize: 14,
      position: 'bottom'
    },
    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true,
            // min: 0,
            // max: 6,
            fontFamily:'Futura-Book',
            fontSize:10,
            stepSize: 1,
          },
          gridLines: {
            offsetGridLines: false
          },
        }
      ],
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: Label[] = ['2006'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [4], label: 'Raised', backgroundColor:'green' },
    { data: [3], label: 'Closed' }
  ];

  constructor(private elRef: ElementRef) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.handleResize(null);
  }
}
