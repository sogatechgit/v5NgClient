import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})


export class LineChartComponent implements OnInit {

  @Input() name: string;
  @Input() title: string;

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
    { data: [8, 1,0], label: 'Raised' },
    { data: [12, 12,20], label: 'Closed' },
  ];
  // public lineChartLabels: Label[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartLabels: Label[] = ['2021', '2020', '2019'];
  public lineChartOptions: ChartOptions = {
    responsive: true,
    scales:{yAxes:[{
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
    }]}
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor:'rgba(255,0,0,0.0)'
      //backgroundColor:'white'
      // backgroundColor: 'rgba(255,0,0,0.3)',
      // backgroundColor: null,
    },
    {
      borderColor: 'red',
      backgroundColor:'rgba(255,0,0,0.0)'
      // backgroundColor: 'rgba(255,0,0,0.3)',
      // backgroundColor: null,
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  constructor() { }

  ngOnInit(): void {
  }

}
