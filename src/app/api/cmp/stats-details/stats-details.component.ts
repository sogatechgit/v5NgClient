import { Component, Input, OnInit, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppMainServiceService } from './../../../svc/app-main-service.service';
import { AppDataset } from 'src/app/svc/app-dataset.service';
import { RequestParams } from '../../mod/app-params.model';
import { DataGridOption, GridParams } from '../data-grid/data-grid.component';
import { PieChartComponent } from './Charts/pie-chart.component';
import { flush } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { DataGridBComponent } from '../data-grid/data-grid-b.component';
import { BarChartComponent } from './Charts/bar-chart.component';
import { DataTab, DataTabsComponent } from '../data-tabs/data-tabs.component';
//import { AppMainServiceService } from './../../svc/app-main-service.service';


@Component({
  selector: 'app-stats-details',
  templateUrl: './stats-details.component.html',
  styleUrls: ['./stats-details.component.scss']
})


export class StatsDetailsComponent implements OnInit, AfterViewInit {
  constructor(public dataSource: AppMainServiceService, public http: HttpClient) {

  }

  @ViewChildren(PieChartComponent) pieCharts: QueryList<PieChartComponent>;
  @ViewChildren(BarChartComponent) barCharts: QueryList<BarChartComponent>;
  @ViewChildren(DataGridBComponent) tables: QueryList<DataGridBComponent>;
  @ViewChild('t') tabs: DataTabsComponent;



  @Input() configFile: string;

  public formGroup: FormGroup = new FormGroup({});

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
  ngAfterViewInit() {

    setTimeout(() => {
      console.log("! UPDATING....", this.pieCharts.first.chart)
      // this.pieCharts.first.pieChartOptions.title.text = "sAMPLE CHANGE";

      // this.pieCharts.first.chart.datasets[0].data.pop();
      // this.pieCharts.first.chart.labels.pop();

      // this.pieCharts.first.chart.datasets[0].data.pop();
      // this.pieCharts.first.chart.labels.pop();

      // this.pieCharts.first.chart.datasets[0].data.push(2);
      // this.pieCharts.first.chart.labels.push('Test');

      // this.pieCharts.first.chart.chart.update()

    }, 2000)
  }

  GetFilterItemControlName(tab: any, item: any): string {

    const { type, name } = item;
    if (type == 'filter') {
      const fltName: string = `${tab.name}_${name}`;
      if (!this.formGroup.get(fltName)) {
        this.formGroup.addControl(fltName, new FormControl(0));
      }

      return fltName;
    } else {
      return null;
    }

  }

  ExternalFilterExpression(tab: any, tableDef: any): string {
    if (!tableDef) return "";
    if (!tableDef.filters ? true : tableDef.filters.length == 0) return "";



    /*
"filters": [
      {
        "name": "year",
        "field": ""
      },
      {
        "name": "flt2",
        "field": ""
      }
    ]
*/

    // const retVal: Array<string> = [];
    // tableDef.filters.forEach(flt => {

    //   const { name, field } = flt;
    //   const tabPrefix = tab.name + '_';
    //   if (name && field) {
    //     const filterControlName = tabPrefix + name;
    //     const value = this.formGroup.get(filterControlName).value;

    //     //1. get reference to filter control and get the value
    //     retVal.push(`{${field}|${value}}`);

    //     // 2. form expression if value is not 0 (i.e. all)
    //   }
    // });

    return "";
  }

  InitSource(): any {

    const path = `./assets/stats-details/${this.configFile}`;
    console.log("InitSource...", path);

    if (!this.configFile) return;

    return new Promise<void>((resolve, reject) => {
      ////do your initialisation stuff here
      const subs = this.http.get(path).subscribe(
        (result: any) => {

          const labels = [];
          let ctr: number = 0;
          result.tabs.forEach(tab => {
            labels.push(tab.label);
            this._tabLabels = labels.join(',');
            if ((tab.charts.length != 0 || tab.tables.length != 0) && (tab.fluid == undefined || tab.fluid)) this._fluidTabs.push(ctr);

            tab.tables.forEach((tab) => tab.params = new GridParams(tab.name, this.ds));
            ctr++;
          });

          this.ProcessConfig(result)

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

  get activeTab(): any {
    if (!this.tabs) return null;
    const tab: DataTab = this.tabs.activeTab;
    if (!tab) return null;
    return tab.tag;
  }

  FilterSelect(event: any, source: any) {
    //console.log("Filter chaged: ", event, source, this.formGroup, this.tables,"\nActive TAB: ", this.activeTab);

    const ctrlName = event.srcElement.id;
    const value = this.formGroup.get(ctrlName).value
    const tables = this.activeTab.tables;
    const tabPrefix = this.activeTab.name + '_';
    console.log("ctrlName: ", ctrlName, value, " TabTables:", tables)

    tables.forEach(tbl => {
      // iterate through all the tables in the tab
      const tableName = tbl.name;
      const tableObject = this.tables.find(tbl => tbl.name == tabPrefix + tableName)

      if (tableObject) {

        // iterate through all the filters associated with the table object
        const expr: Array<string> = [];
        tbl.filters.forEach(flt => {
          const fltCtrName = tabPrefix + flt.name
          const fltValue = this.formGroup.get(fltCtrName).value
          if (fltValue != "0") expr.push(`{${flt.field}|${fltValue}}`)
        })

        tableObject.extFilterExpression = expr.length ? `(${expr.join('^')})` : "";
        tableObject.RefreshClick(null);
      }
    })


  }

  HeaderItem(item: any): any {
    const { type, name } = item;
    if (type == 'filter') {
      return this._configJSON.filters.find(flt => flt.name == name);
    } else {
      return null;
    }
    // return name
  }

  TabClicked(event: any) {
    console.log("TabClicked: ", event, "\nActive TAB: ", this.activeTab)
  }

  ProcessConfig(result: any) {
    this._configJSON = result;
    console.log("table configs: ", this._configJSON.tabs);

    // set filter parameters
    /* sample filter configuration
      "params": {
        "source": "devmain",
        "value": "RAISEDYEAR",
        "display": "RAISEDYEAR",
        "sort": "-RAISEDYEAR"
      },
      "data": [
        {
          "value": 2021,
          "display": "2021"
        }
      ]
     */

    const reqParams: Array<RequestParams> = []
    const processedFilters: Array<any> = []
    this._configJSON.filters.forEach(flt => {

      processedFilters.push(flt);
      const { source, display, value, sort } = flt.params;

      reqParams.push({
        code: source,
        includedFields: `${value}@VALUE\`${display ? display : value}@DISPLAY`,
        sortFields: sort,
        snapshot: true,
        distinct: true
      })

    });

    // process charts data


    // console.log("filter reqParams: ", reqParams)

    this.ds.Get(reqParams, {
      onSuccess: (data) => {
        // console.log("@@@@ Filter Data: ",reqParams, data);

        for (let idx = 0; idx <= processedFilters.length; idx++) {
          const flt = processedFilters[idx];
          if (flt) {
            const rows = data.processed.data[idx];
            const opts: Array<any> = [];
            if (rows) {
              rows.forEach(row => {
                opts.push({ value: row.XTRA.VALUE, display: row.XTRA.DISPLAY })
              })
            }
            flt.data = opts;
          }
        }

        // update chart(s)
        this.pieCharts.first.data = {
          values: [12, 50],
          titles: ['Raised', 'Closed'],
          backgroundColor: ['#dc3545', '#28a745']
        }

      }
    })
  }

}
