import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppMainServiceService } from './../../../svc/app-main-service.service';
import { AppDataset } from 'src/app/svc/app-dataset.service';
import { RequestParams } from '../../mod/app-params.model';
import { DataGridOption, GridParams } from '../data-grid/data-grid.component';
//import { AppMainServiceService } from './../../svc/app-main-service.service';


@Component({
  selector: 'app-stats-details',
  templateUrl: './stats-details.component.html',
  styleUrls: ['./stats-details.component.scss']
})


export class StatsDetailsComponent implements OnInit {
  constructor(public dataSource: AppMainServiceService, public http: HttpClient) {

  }
  // constructor() { }

  @Input() configFile: string;

  private _configJSON: any;
  @Input() set configJSON(value: any) {
    this._configJSON = value;
  }

  get configJSON(): any {
    return this._configJSON;
  }

  get ds(): AppDataset {
    if (!this.dataSource) return null;
    return this.dataSource.ActiveSource.appDataset;
  }

  ngOnInit(): void {
    if (!this.ds) return;

    this.InitSource();

  }

  InitSource(): any {

    const path = `./assets/stats-details/${this.configFile}`;
    console.log("InitSource...", path);

    if (!this.configFile) return;

    return new Promise<void>((resolve, reject) => {
      ////do your initialisation stuff here
      const subs = this.http.get(path).subscribe(
        (result: any) => {
          console.log("@@@@@ stats details result: ", result);

          const labels = [];
          let ctr: number = 0;
          result.tabs.forEach(tab => {
            labels.push(tab.label);
            this._tabLabels = labels.join(',');
            if ((tab.charts.length != 0 || tab.tables.length != 0) && (tab.fluid == undefined || tab.fluid)) this._fluidTabs.push(ctr);

            tab.tables.forEach((tab) => tab.params = new GridParams(tab.name, this.ds));
            ctr++;
          });

          this._configJSON = result;
          console.log("table configs: ",this._configJSON.tabs)

          resolve();
          subs.unsubscribe();


          // get Actual Data....
          const params: Array<RequestParams> = [{
            code: '',
            filter: ``,
            includedFields: '',
            sortFields: '',
            snapshot: true
          }]


          const sdata = this.ds.Get(params, {
            onSuccess: (data) => {
              console.log("SEISMIC DATA: ", data);
            },
            onError: (err) => {

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

  @Input() RowHeaderHeight: number;
  @Input() RowHeaderWidth: number;
  @Input() RowHeight: number;
  @Input() noFooter: boolean = true;

  private _options: DataGridOption = null;
  public get options(): DataGridOption {
    if (!this._options) {
      // initialize data grid options
      let opt: DataGridOption = new DataGridOption([]);

      opt
        .SetRowHeaderHeight(this.RowHeaderHeight)
        .SetRowHeaderWidth(this.RowHeaderWidth)
        .RowHeight(this.RowHeight);

      if (this.noFooter) {
        opt.NoFooter();
      } else {
        opt.WithFooter();
      }

      this._options = opt;
    }

    return this._options;
  }

  private _tabLabels: string;
  get tabLabels(): string {
    return this._tabLabels;
  }

  private _fluidTabs: Array<number> = [];
  get fluidTabs(): Array<number> {
    return this._fluidTabs;
  }

  get activeTabDef(): any {
    return {
      label: "Sample",
      tables: [
        { name: "tbl1", bg: "red" },
        { name: "tbl2", bg: "blue" },
        { name: "tbl3", bg: "yellow" }
      ],
      charts: [
        { name: "ch1", bg: "magenta" },
        { name: "ch2", bg: "cyan" }
      ],
      style: {
        'grid-template-columns': '1fr repeat(2, 250px)',
        'grid-template-rows': 'repeat(2, 200px) 1fr',
        'grid-template-areas': `"ch1  tbl1  tbl1" 
                                "ch1  ch2  tbl2" 
                                "tbl3 tbl3 tbl2"`
      }
    }
  }
  get gridStyle(): any {
    return {};
  }

}
