import { Component, Input, OnInit, ViewChild, ViewChildren, QueryList, AfterViewInit, ComponentFactoryResolver } from '@angular/core';
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
  public filtersReady: boolean = false;

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

    // setTimeout(() => {
    //   this.filtersReady = true;
    //   console.log("! filtersReady....")
    // },4000)

    setTimeout(() => {
      // this.pieCharts.first.pieChartOptions.title.text = "sAMPLE CHANGE";

      // this.pieCharts.first.chart.datasets[0].data.pop();
      // this.pieCharts.first.chart.labels.pop();

      // this.pieCharts.first.chart.datasets[0].data.pop();
      // this.pieCharts.first.chart.labels.pop();

      // this.pieCharts.first.chart.datasets[0].data.push(2);
      // this.pieCharts.first.chart.labels.push('Test');

      // this.pieCharts.first.chart.chart.update()

    }, 0)
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

  FilterSelect(event: any, item: any) {

    if (item.type != 'filter') return;

    const ctrlName = event.srcElement.id;
    const value = this.formGroup.get(ctrlName).value
    const tables = this.activeTab.tables;
    const tabPrefix = this.activeTab.name + '_';

    // apply external filters to referencing table(s)
    tables.forEach(tbl => {

      // test if filter is applicable and continue if not applicable
      if (!tbl.filters) return;
      if (!tbl.filters.find(flt => flt.name == item.name)) return;

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
    }) // tables.forEach ...

    const pieCharts = this.pieCharts;
    const barCharts = this.barCharts;

    if (pieCharts) {
      // pieCharts.forEach(ch => {
      //   // test if filter is applicable and continue if not applicable
      //   if (!ch.filters) return;
      //   if (!ch.filters.find(flt => flt.name == item.name)) return;

      // })
      console.log("Pie charts on active tab:", pieCharts)
      this.UpdateActiveTab();
    } else {
      console.log("No pie charts on active tab:", this.activeTab)
    }

    if (barCharts) {
      // barCharts.forEach(ch => {
      //   // test if filter is applicable and continue if not applicable
      //   if (!ch.filters) return;
      //   if (!ch.filters.find(flt => flt.name == item.name)) return;

      // })
      console.log("Bar charts on active tab:", barCharts)
    } else {
      console.log("No bar charts on active tab", this.activeTab)
    }


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
    //console.log("TabClicked: ", event, "\nActive TAB: ", this.activeTab)
    this.UpdateActiveTab();
  }

  UpdateActiveTab() {
    if (!this.activeTab) return;
    // console.log("ACTIVE TAB: ", this.activeTab, ", Config:", this.configJSON);

    const reqParams: Array<RequestParams> = [];
    const tabName = this.activeTab.name;
    const pie = this.activeTab.charts.filter(ch => ch.type == 'pie')
    const bar = this.activeTab.charts.filter(ch => ch.type == 'bar')

    pie.forEach(ch => {
      const { aggregate, series, tableCode, name } = ch;
      // console.log(`Name:${name}, Table:${tableCode}, Aggregate:${aggregate}, Series:${series}`, ch)

      let title = ch.title;
      let filters: any[] = [];
      let fltExpr: string[] = [];

      if (ch.filters) {
        // if filter(s) is specified, change title to filter selected value


        ch.filters.forEach(cflt => {
          const { name, field } = cflt;
          const nameArr = name.split(':');
          const fltName = nameArr[0];
          const valIdx = nameArr.length >= 2 ? nameArr[1] : -1;

          const fltCtrlName = tabName + '_' + fltName;
          const fltCtrl = this.formGroup.get(fltCtrlName);

          if (fltCtrl) {
            if (fltCtrl.value != "0") {
              const fltValue = valIdx != -1 ? fltCtrl.value.split(',')[valIdx] : fltCtrl.value
              filters.push({ name: fltName, value: fltValue });
              fltExpr.push(`{${field}|${fltValue}}`)
            }
          }


        })
      }

      if (fltExpr.length != 0) {
        if (ch.titleExpression) title = ch.titleExpression;
        filters.forEach(flt => {
          console.log("flt.name: ", flt.name)
          const placeholder = `$\{${flt.name}\}`
          title = title.replace(placeholder, flt.value)
        })
      }

      const reqParam: RequestParams = {
        code: tableCode,
        includedFields: `${aggregate}@DATA\`${series}@SERIES`,
        filter: fltExpr.length ? `(${fltExpr.join('^')})` : '',
        snapshot: true,
        XTRA: { title: title, chartName: ch.name }
      }

      // append request param to common reqPrams array
      reqParams.push(reqParam);


    }) // pie chart iteration


    bar.forEach(ch => {

      const chObj = this.barCharts.find(bar => bar.name == ch.name);

      // console.log("BAR Chart: ", ch, chObj)

      // chObj.data = {
      //   barChartTitle: 'Multi Dataset Multi Value Bar Chart',
      //   barChartLabels: ['2019','2020','2021'],
      //   barChartData: [
      //     { data: [2,6,5], label: 'Raised', backgroundColor: this.SeriesColor('Raised') },
      //     { data: [5,8,7], label: 'Closed', backgroundColor: this.SeriesColor('Closed') }
      //   ]
      // }

      // chObj.data = {
      //   barChartTitle: 'Multi Dataset Single Value Bar Chart',
      //   barChartLabels: ['Performance'],
      //   barChartData: [
      //     { data: [2], label: 'Raised', backgroundColor: this.SeriesColor('Raised') },
      //     { data: [5], label: 'Closed', backgroundColor: this.SeriesColor('Closed') }
      //   ]
      // }

      chObj.data = {
        barChartTitle: 'Single Dataset Bar Chart',
        barChartLabels: ['Initialized', 'Cancelled', 'Extended'],
        barChartData: [{
          data: [3, 5, 2], backgroundColor: [
            this.SeriesColor('Initialized','lime'), 
            this.SeriesColor('Cancelled'),
            this.SeriesColor('Extended')]
        }]
      }

      // ch.update();

    }) // bar chart iteration


    if (reqParams.length) {
      // this.ds.Get(reqParams, {onSuccess:(data)=>{

      // })
      this.ds.Get(reqParams, {
        onSuccess: data => {

          let resIdx: number = 0;
          reqParams.forEach(prm => {
            const { title, chartName } = prm.XTRA;
            const chObj = this.pieCharts.find(pie => pie.name == chartName);

            // console.log("CHART INFO:", prm.XTRA, ", chObj:", chObj);

            if (chObj) {
              const chDef = pie.find(ch => ch.name == chartName);

              let seriesTitles = chDef.seriesFixedTitles ? chDef.seriesFixedTitles : []
              let seriesValues = [];
              const chData = data.processed.data[resIdx];

              if (seriesTitles.length) {
                // if fixed titles are specified
                if (chData.length == 0) {
                  // set all data to 0
                  seriesTitles.forEach(ser => { seriesValues.push(0); });
                } else {
                  seriesTitles.forEach(ser => {
                    const rec = chData.find(r => r.XTRA.SERIES == ser);
                    seriesValues.push(rec ? rec.XTRA.DATA : 0);
                  })
                }

              } else {
                // series is defined by the data extracted
                const stitles: string[] = [];
                chData.forEach(r => {
                  stitles.push(r.XTRA.SERIES);
                  seriesValues.push(r.XTRA.DATA);
                })
                seriesTitles = stitles;
              }

              // console.log(`CHART DATA chData (${chartName}) : `, chData)

              const serColors = this.configJSON.chartBackgroundsBySeries;
              let backColors: string[] = this.configJSON.chartBackgrounds;
              if (chDef.useSeriesColors && serColors) {
                backColors = [];
                seriesTitles.forEach(ser => {
                  backColors.push(serColors.find(clr => clr.series == ser).color)
                })
              }

              chObj.title = title;
              chObj.data = {
                values: seriesValues,
                titles: seriesTitles,
                backgroundColor: backColors
              }
            }
            resIdx++;
          })
        }
      })
    }

    // const chObj = this.pieCharts.find(cho => cho.name == `${ch.name}`);
    // if (chObj) {
    //   // update chart
    //   chObj.title = title;
    //   chObj.data = {
    //     values: [50, 50],
    //     titles: ['Raised', 'Closed'],
    //     backgroundColor: this.configJSON.chartBackgrounds
    //   }
    // }


    // update chart(s)
    // console.log("this.pieCharts.first.name: ",this.pieCharts.first.name)
    // this.pieCharts.first.data = {
    //   values: [50, 50],
    //   titles: ['Raised', 'Closed'],
    //   backgroundColor: this.configJSON.chartBackgrounds
    // }

  }

  SeriesColor(seriesName: string, defaultColor?: string): string {
    if (!defaultColor) defaultColor = '#c0c0c0';
    if (!this.configJSON) return defaultColor;
    if (!this.configJSON.chartBackgroundsBySeries) return defaultColor;

    const bg = this.configJSON.chartBackgroundsBySeries.find(clr => clr.series == seriesName);
    return bg ? bg.color : defaultColor;
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

      // collect all filters with parameters formed.
      processedFilters.push(flt);
      // deconstruct filter parameters
      const { source, display, value, sort, minmax } = flt.params;

      if (minmax) {

        reqParams.push({
          code: source,
          includedFields: `min(${value})@MIN\`max(${value})@MAX`,
          snapshot: true
        });

      } else {

        reqParams.push({
          code: source,
          includedFields: `${value}@VALUE\`${display ? display : value}@DISPLAY`,
          sortFields: sort,
          snapshot: true,
          distinct: true
        });

      }

    });

    // create filter form controls for all tabs
    const processedControls: any = {};
    this.configJSON.tabs.forEach(tab => {
      // console.log('TAB: ',tab.name, tab.label,tab.tables, tab.charts, tab.headers)
      // process filter controls from headers

      if (tab.headers) {
        // headers exist in tab
        tab.headers.forEach(hdr => {
          // iterate through the items in the header
          hdr.items.forEach(item => {
            // select only header items of filter type
            if (item.type == 'filter') {
              // get control name
              const ctlName = tab.name + '_' + item.name;

              // set colection of control names using the filter object
              if (!processedControls[item.name]) processedControls[item.name] = [];
              processedControls[item.name].push({ name: ctlName, noAll: item.noAll, defLast: item.defLast });

              // add control to the formGroup
              this.formGroup.addControl(ctlName, new FormControl(null));
            }
          })
        });
      }

    });

    // process charts data


    // console.log("filter reqParams: ", reqParams)

    this.ds.Get(reqParams, {
      onSuccess: (data) => {

        for (let idx = 0; idx <= processedFilters.length; idx++) {
          const flt = processedFilters[idx];
          if (flt) {
            const rows = data.processed.data[idx];
            const opts: Array<any> = [];
            const { minmax, step } = flt.params;
            const rangeStep = step ? step : 1;
            if (rows) {
              if (minmax) {
                const row = rows[0];
                const { MIN, MAX } = row.XTRA;

                for (let idx = MIN; idx <= (MAX - rangeStep); idx++) {
                  const years: string[] = [];
                  // build option values
                  for (let yr = idx; yr <= (idx + rangeStep); yr++) {
                    years.push(yr);
                  }
                  // build option objects
                  opts.push({ value: years.join(','), display: `${idx}-${idx + step}` });

                }

              } else {
                rows.forEach(row => {
                  opts.push({ value: row.XTRA.VALUE, display: row.XTRA.DISPLAY })
                })
              }

            }

            flt.firstValue = opts.length ? opts[0].value : "0";
            flt.lastValue = opts.length ? opts[opts.length - 1].value : "0";
            flt.data = opts;

            // set filter controls default values
            if (processedControls[flt.name]) {
              processedControls[flt.name].forEach(ctlObj => {
                const { name, noAll, defLast } = ctlObj;
                const ctl = this.formGroup.get(name);
                if (ctl) {
                  ctl.setValue(noAll ? (defLast ? flt.lastValue : flt.firstValue) : "0")
                } else {
                  console.log("Filter control not found!!!!")
                }
              })
            }

          }
        } // processedFilters loop


        this.UpdateActiveTab();

        this.filtersReady = true

      }
    })
  }

}
