import { Component, Input, OnInit, ViewChild, ViewChildren, QueryList, AfterViewInit, HostListener } from '@angular/core';
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
import { identifierModuleUrl } from '@angular/compiler';
import { Console } from 'node:console';
import { select } from 'd3-selection';
import { LineChartComponent } from './Charts/line-chart.component';
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
  @ViewChildren(LineChartComponent) lineCharts: QueryList<LineChartComponent>;
  @ViewChildren(DataGridBComponent) dataGrids: QueryList<DataGridBComponent>;

  @ViewChild('t') tabs: DataTabsComponent;

  public isLoadingRecords: boolean = false;
  public maskMessage: string = "Updating. Please wait..."

  private _name: string = "";
  @Input() set name(value: string) {
    this._name = `status_details_${value}`;
  }
  get name(): string {
    return this._name ? this._name : "status_details"
  }

  @Input() configFile: string;

  @Input() printerFriendly: boolean = false;

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

  public printMode: boolean = false;
  @HostListener('window:beforeprint')
  onbeforeprint() {
    this.printMode = true;
    setTimeout(() => { })
    for (let x = 0; x < 10000000; x++) { }
    //console.log("statWidth: ", this.statWidth,this.printMode)
  }

  @HostListener('window:afterprint')
  onafterprint() {
    this.printMode = false;
    setTimeout(() => { this.Refresh(); }, 1000);
    //if(this.stats) this.stats.Refresh();
    //console.log("statWidth: ", this.statWidth,this.printMode)
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

    if (!this.printerFriendly) {
      // reset all localStorage related to statsDetails component
      this.localSettings = null;
    }

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


          // // get Actual Data....
          // const params: Array<RequestParams> = [{
          //   code: '',
          //   filter: ``,
          //   includedFields: '',
          //   sortFields: '',
          //   snapshot: true
          // }]


          // const sdata = this.ds.Get(params, {
          //   onSuccess: (data) => {
          //   },
          //   onError: (err) => {

          //   }
          // })


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

  SetLocalStorage(itemName: string, value: any) {

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

  get localSettings(): any {
    if (!localStorage[this.name]) localStorage[this.name] = "{}";
    return JSON.parse(localStorage[this.name]);
  }

  set localSettings(value: any) {
    // accepts JSON object
    if (value) {
      const localSettings = this.localSettings;
      for (let key in value) {
        // console.log("@@@@@ KEY: ", key)
        localSettings[key] = value[key];
      }

      // console.log("##### localSettings: ", this.name, " - ", localSettings);
      localStorage[this.name] = JSON.stringify(localSettings);
    } else {
      localStorage[this.name] = "{}";
    }
  }

  KeyValuePair(key: string, value: any, convertToString?: boolean): any {
    if (convertToString == undefined) convertToString = true;
    const newObj = {};
    newObj[key] = convertToString ? String(value) : value;
    return newObj;
  }

  FilterSelect(event: any, item: any) {

    if (this.printerFriendly) return;
    if (item.type != 'filter') return;

    const ctrlName = event.srcElement.id;
    const value = this.formGroup.get(ctrlName).value
    const tables = this.activeTab.tables;
    const tabPrefix = this.activeTab.name + '_';

    const localSettings = this.localSettings;

    console.log("localSettings: ", this.localSettings);
    console.log(`Control name: ${ctrlName}, NewValue: ${value}, OldValue: ${localSettings[ctrlName]}`)

    this.localSettings = this.KeyValuePair(ctrlName, value);

    this.UpdateAllTabs();

    return;


    // apply external filters to referencing table(s)
    tables.forEach(tbl => {

      // test if filter is applicable and continue if not applicable
      if (!tbl.filters) return;
      if (!tbl.filters.find(flt => flt.name == item.name)) return;

      // iterate through all the tables in the tab
      const tableName = tbl.name;
      const tableObject = this.dataGrids.find(tbl => tbl.name == tabPrefix + tableName)

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

  CascadeTitle(ch: any) {
    const { titleSubstitutions } = ch;
    // if (!titleSubstitutions) return;
    // if (titleSubstitutions.length == 0) return;

    if(!this.activeTab) return;

    const och = this.activeTab.charts.filter(cht => cht.dataRefObjectName == ch.name)
    och.forEach(chto => {
      // set visibleTitle
      let title: string;
      if (titleSubstitutions && titleSubstitutions.length != 0) {
        title = chto.titleExpression ? chto.titleExpression : chto.title;
        titleSubstitutions.forEach(subs => {
          title = title.replace(subs.fromText, subs.toText);
        })
      } else {
        title = chto.title;
      }

      chto.visibleTitle = title;

    })
  }

  GetFilterOperator(operator: string, noPipe?: boolean): string {
    if (!operator ? true : operator == '=') return '';    // empty string or eq is same as equal
    if (!noPipe) noPipe = false;
    switch (operator) {
      case '<':
        return 'lt' + (noPipe ? '' : '|');
      case '>':
        return 'gt' + (noPipe ? '' : '|');
      case '>=':
        return 'gte' + (noPipe ? '' : '|');
      case '<=':
        return 'lte' + (noPipe ? '' : '|');
      case '<>':
        return 'neq' + (noPipe ? '' : '|');
      default:
        return operator + (noPipe ? '' : '|');;

    }
  }

  UpdateActiveTab() {
    if (!this.activeTab) return;

    const tabName = this.activeTab.name;

    this.UpdateTab(tabName);

  }

  UpdateAllTabs() {

    if (!this.printerFriendly) {
      this.maskMessage = "Updating charts and tables. Please wait..."
      this.isLoadingRecords = true;
    }

    setTimeout(() => {

      // for(let idx=0;idx<this.configJSON.tabs.length;idx++){
      //   const tab = this.configJSON.tabs[idx];
      //   this.UpdateTab(tab.name);
      // }

      const chtb = this.configJSON.tabs.filter(tab => (tab.charts.length != 0 || tab.tables.length != 0));

      let idx = 1;
      chtb.forEach(tab => {
        this.UpdateTab(tab.name, (idx == chtb.length));
        idx++;
      });
    }, 10)
  }


  UpdateTab(tabName: string, isLastTab?: boolean) {
    if (isLastTab == undefined) isLastTab = true;

    const reqParams: Array<RequestParams> = [];
    const paramConfigData: any = {}

    this.CollectPieParams(tabName, reqParams, paramConfigData);
    this.CollectChartParams(tabName, reqParams, paramConfigData, 'bar');
    this.CollectChartParams(tabName, reqParams, paramConfigData, 'line');

    if (reqParams.length) {
      // this.ds.Get(reqParams, {onSuccess:(data)=>{

      // })
      this.ds.Get(reqParams, {
        configData: paramConfigData,
        onSuccess: data => {

          this.UpdatePieCharts(tabName, data, paramConfigData);
          this.UpdateCharts(tabName, data, paramConfigData, 'bar');
          this.UpdateCharts(tabName, data, paramConfigData, 'line');

          if (isLastTab) this.isLoadingRecords = false;

        }
      })
    }

    this.UpdateTables(tabName);

  }

  UpdateTables(tabName) {
    if (this.dataGrids) {
      this.dataGrids.forEach(grd => console.log("UpdateTables, DataGrid:", grd.name))
    } else {
      console.log("No data grids defined");
    }
  }



  CollectChartParams(tabName: string, params: Array<RequestParams>, paramConfigData: any, chartType?: string) {
    if (!chartType) chartType = 'bar';

    const tab = this.configJSON.tabs.find(tab => tab.name == tabName);
    const charts = tab.charts.filter(ch => ch.type == chartType);
    charts.forEach(ch => {

      // loop through all bar chart definitions to build collection of
      // request parameters

      const { aggregate, series, tableCode, name, dataRefObjectName, seriesGroup, seriesData } = ch;

      if (dataRefObjectName) return;  // if chart is not borrowing data from anothe chart definition

      let fields = seriesGroup ? seriesGroup : '';
      let title = ch.title;
      let filters: any[] = [];
      let fltExpr: string[] = [];

      if (seriesData) {
        // eg. sum(ISCOMPLETE)@COMP|Completed`sum(ISONPROGRESS)@PROG|On Progress
        // aggregate@alias|label
        const fldsArr = seriesData.split('`');  // split field defs
        fldsArr.forEach(fld => {
          fields += (fields ? '`' : '') + fld.split('|')[0];
        })

      }

      if (ch.filters) {

        // if filter(s) is specified, change title to filter selected value

        ch.filters.forEach(cflt => {
          const { name, field, operator } = cflt;
          const nameArr = name.split(':');  // split filter to filter name and filter value index
          const fltName = nameArr[0];
          const valIdx = nameArr.length >= 2 ? nameArr[1] : -1;

          const fltCtrlName = tabName + '_' + fltName;
          const fltCtrl = this.formGroup.get(fltCtrlName);

          if (fltCtrl) {
            // filter control exists
            if (fltCtrl.value != "0") {
              // if filter value is not All
              const fltValue = valIdx != -1 ? fltCtrl.value.split(',')[valIdx] : fltCtrl.value

              filters.push({ name: fltName, value: fltValue });
              fltExpr.push(`{${field}|${this.GetFilterOperator(operator)}${fltValue}}`);
            }
          }
        })
      }

      ch.titleSubstitutions = [];

      if (fltExpr.length != 0) {
        if (ch.titleExpression) title = ch.titleExpression;
        filters.forEach(flt => {
          const placeholder = `$\{${flt.name}\}`
          ch.titleSubstitutions.push({ fromText: placeholder, toText: flt.value });
          title = title.replace(placeholder, this.EnumString(flt.value));
          // check if any of the other charts are using data from the current chart

        })
      }

      const reqParam: RequestParams = {
        code: tableCode,
        includedFields: fields,
        filter: fltExpr.length ? `(${fltExpr.join('^')})` : '',
        sortFields: seriesGroup,
        snapshot: true
      }

      // set chart's visibleTitle and cascade title subtitution to other charts
      ch.visibleTitle = title;
      this.CascadeTitle(ch);

      // set parameter index in configData
      paramConfigData[ch.name] = params.length;

      // append request param to common reqPrams array
      params.push(reqParam);

    }) // bar chart iteration

  }

  CollectPieParams(tabName: string, params: Array<RequestParams>, paramConfigData: any) {
    const tab = this.configJSON.tabs.find(tab => tab.name == tabName);

    const charts = tab.charts.filter(ch => ch.type == 'pie');

    charts.forEach(ch => {

      // loop through all pie chart definitions to build collection of
      // request parameters

      const { aggregate, series, tableCode, name, dataRefObjectName } = ch;

      let title = ch.title;
      let filters: any[] = [];
      let fltExpr: string[] = [];

      if (ch.filters) {
        // if filter(s) is specified, change title to filter selected value

        ch.filters.forEach(cflt => {
          const { name, field, operator } = cflt;
          const nameArr = name.split(':');
          const fltName = nameArr[0];
          const valIdx = nameArr.length >= 2 ? nameArr[1] : -1;

          const fltCtrlName = tabName + '_' + fltName;
          const fltCtrl = this.formGroup.get(fltCtrlName);

          if (fltCtrl) {
            if (fltCtrl.value != "0") {
              const fltValue = valIdx != -1 ? fltCtrl.value.split(',')[valIdx] : fltCtrl.value
              filters.push({ name: fltName, value: fltValue });
              fltExpr.push(`{${field}|${this.GetFilterOperator(operator)}${fltValue}}`)
            }
          }

        })
      }

      ch.titleSubstitutions = [];

      if (fltExpr.length != 0) {
        if (ch.titleExpression) title = ch.titleExpression;
        filters.forEach(flt => {
          const placeholder = `$\{${flt.name}\}`
          ch.titleSubstitutions.push({ fromText: placeholder, toText: flt.value });
          title = title.replace(placeholder, flt.value);
          // check if any of the other charts are using data from the current chart

        })
      }

      const reqParam: RequestParams = {
        code: tableCode,
        includedFields: `${aggregate}@DATA\`${series}@SERIES`,
        filter: fltExpr.length ? `(${fltExpr.join('^')})` : '',
        snapshot: true,
        XTRA: { title: title, chartName: ch.name }
      }

      // set chart's visibleTitle and cascade title subtitution to other charts
      ch.visibleTitle = title;
      this.CascadeTitle(ch);

      // set parameter index in configData
      paramConfigData[ch.name] = params.length;

      // append request param to common reqPrams array
      params.push(reqParam);


    }) // pie chart iteration

  }

  UpdateCharts(tabName: string, source: any, paramConfigData: any, chartType?: string) {
    if (!chartType) chartType = 'bar';


    const noBackground = (chartType == 'line');

    const tab = this.configJSON.tabs.find(tab => tab.name == tabName);
    const charts = tab.charts.filter(ch => ch.type == chartType);
    charts.forEach(
      ch => {

        const { dataRefObjectName, seriesData, seriesGroup, active, name, xAxisTitle, yAxisTitle } = ch;

        const datIdx = paramConfigData[!dataRefObjectName ? ch.name : dataRefObjectName];
        const chData = source.processed.data[datIdx];
        const chObj = this[chartType + 'Charts'].find(cht => cht.name == ch.name);
        const xAxisLabels: string[] = []

        if (active != undefined ? !active : false) return;

        let verticalGrid: boolean = false;

        // form data collection
        const datasets: any[] = [];

        const fldsArr = seriesData.split('`');
        fldsArr.forEach(fld => {
          const fldArr = fld.split('|');
          const fldDataArr = fldArr[0].split('@');
          const fldRef = fldDataArr[fldDataArr.length - 1];
          const fldLabel = fldArr.length == 1 ? fldRef : fldArr[fldArr.length - 1];

          datasets.push({
            data: [], label: fldLabel, fldRef: fldRef,
            backgroundColor: noBackground ? 'rgba(255,0,0,0.0)' : this.SeriesColor(fldLabel),
            borderColor: noBackground ? this.SeriesColor(fldLabel) : 'rgba(255,0,0,0.0)'
          })
        });

        chData.forEach(row => {
          if (seriesGroup) xAxisLabels.push(row[seriesGroup]);

          datasets.forEach(ds => {
            const dataValue = row.XTRA[ds.fldRef];
            ds.data.push(dataValue == undefined ? 0 : dataValue)
          })
        })

        verticalGrid = true;

        if (chObj)
          chObj.data = {
            chartTitle: ch.visibleTitle,
            legendPosition: ch.legendPosition,
            chartLabels: xAxisLabels.length ? xAxisLabels : null,
            chartData: datasets,
            verticalGrid: verticalGrid,
            yAxisTitle: ch.yAxisTitle,
            xAxisTitle: ch.xAxisTitle
          }
        else console.log(`Chart object not found ${name}`);


      } // end of forEach chart function 

    )  // end of forEach chart loop

  }

  UpdatePieCharts(tabName: string, souece: any, paramConfigData: any) {

    const tab = this.configJSON.tabs.find(tab => tab.name == tabName);
    const charts = tab.charts.filter(ch => ch.type == 'pie');
    charts.forEach(ch => {

      const { dataRefObjectName, active, name } = ch;

      const datIdx = paramConfigData[!dataRefObjectName ? ch.name : dataRefObjectName];
      const chData = souece.processed.data[datIdx];
      const chObj = this.pieCharts.find(pie => pie.name == ch.name);

      let seriesTitles = ch.seriesFixedTitles ? ch.seriesFixedTitles : []
      let seriesValues = [];

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

      const serColors = this.configJSON.chartBackgroundsBySeries;
      let backColors: string[] = this.configJSON.chartBackgrounds;
      if (ch.useSeriesColors && serColors) {
        backColors = [];
        seriesTitles.forEach(ser => {
          backColors.push(serColors.find(clr => clr.series == ser).color)
        })
      }

      if (chObj) {
        chObj.title = ch.visibleTitle;
        chObj.data = {
          values: seriesValues,
          titles: seriesTitles,
          backgroundColor: backColors
        }
      }

    })
  }

  SeriesColor(seriesName: string, defaultColor?: string): string {
    if (!defaultColor) defaultColor = '#c0c0c0';
    if (!this.configJSON) return defaultColor;
    if (!this.configJSON.chartBackgroundsBySeries) return defaultColor;

    const bg = this.configJSON.chartBackgroundsBySeries.find(clr => clr.series == seriesName);
    return bg ? bg.color : defaultColor;
  }

  EnumString(str: string, replacementText?: string): string {
    if (!str) return '';
    if (!str.split) return '';

    if (!replacementText) replacementText = "&";
    const strArr = str.split(',');
    if (strArr.length < 2) return str;
    const lastElem = strArr[strArr.length - 1];
    strArr.pop();
    return `${strArr.join(', ')} ${replacementText} ${lastElem}`;
  }

  ProcessConfig(result: any) {
    this._configJSON = result;

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
          includedFields: `min(${value})@MINVALUE\`max(${value})@MAXVALUE`,
          snapshot: true
        });

      } else {

        reqParams.push({
          code: source,
          includedFields: `${value}@DATAVALUE\`${display ? display : value}@DISPLAY`,
          sortFields: sort,
          snapshot: true,
          distinct: true
        });

      }

    });

    // create filter form controls for all tabs
    const processedControls: any = {};
    this.configJSON.tabs.forEach(tab => {
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
              processedControls[item.name].push({ name: ctlName, noAll: item.noAll, defLast: item.defLast, defFirst: item.defFirst, defValue: item.defValue });

              // add control to the formGroup
              this.formGroup.addControl(ctlName, new FormControl(null));
            }
          })
        });
      }

    });

    // process charts data

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
                const { MINVALUE, MAXVALUE } = row.XTRA;

                for (let idx = MINVALUE; idx <= (MAXVALUE - rangeStep); idx++) {
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
                  opts.push({ value: row.XTRA.DATAVALUE, display: row.XTRA.DISPLAY })
                })
              }

            }

            flt.firstValue = opts.length ? opts[0].value : "0";
            flt.lastValue = opts.length ? opts[opts.length - 1].value : "0";
            flt.data = opts;

            const withOpts = (opts.length != 0);

            // set filter controls default values
            if (processedControls[flt.name]) {
              processedControls[flt.name].forEach(ctlObj => {
                const { name, noAll, defLast, defFirst, defValue } = ctlObj;
                const ctl = this.formGroup.get(name);

                const inOpts = !defValue ? null : opts.find(opt => opt.value == defValue);

                const defaultValue: any = inOpts ? defValue : "";

                if (ctl) {
                  // ctl.setValue(noAll ? (defLast ? flt.lastValue : flt.firstValue) : "0");
                  if (defaultValue) {
                    ctl.setValue(defaultValue)
                  } else if (defFirst && withOpts) {
                    ctl.setValue(flt.firstValue)
                  } else if (defLast && withOpts) {
                    ctl.setValue(flt.lastValue)
                  } else if (noAll && withOpts) {
                    ctl.setValue(flt.firstValue)
                  } else {
                    ctl.setValue("0")
                  }
                  // defFirst
                } else {
                  console.log("Filter control not found!!!!")
                }
              })
            }

          }
        } // processedFilters loop


        //this.UpdateActiveTab();

        this.UpdateAllTabs();

        this.filtersReady = true

      }
    })
  }

  Refresh() {

    if (this.dataGrids) this.dataGrids.forEach(grid => grid.RefreshClick(null))

    if (this.pieCharts) this.pieCharts.forEach(ch => ch.handleResize(null));
    if (this.barCharts) this.barCharts.forEach(ch => ch.handleResize(null));
    if (this.lineCharts) this.lineCharts.forEach(ch => ch.handleResize(null));

  }

}

export enum BarDataType {
  MultiDatasetSingleValue = "MDSV",
  MultiDatasetMultiValue = "MDMV",
  SingleDataset = "SD",
}