import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';


@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          display: true,
          ticks: {
            beginAtZero: true
            // min: 0,
            // max: 6,
            // stepSize: 2,
          },
          gridLines: {
            offsetGridLines: false
          }
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
    { data: [4], label: 'Raised' },
    { data: [3], label: 'Closed' }
  ];

  constructor() { }

  ngOnInit() {
  }
}
