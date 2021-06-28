import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DataGridBComponent } from 'src/app/api/cmp/data-grid/data-grid-b.component';
import { AppDataset } from 'src/app/svc/app-dataset.service';
import { AppMainServiceService } from 'src/app/svc/app-main-service.service';
import { FreespanComponent } from './freespan.component';

@Component({
  selector: 'app-survey-select',
  templateUrl: './survey-select.component.html',
  styleUrls: ['./survey-select.component.scss']
})
export class SurveySelectComponent implements OnInit, AfterViewInit {

  constructor(public dataSource: AppMainServiceService) { }

  @ViewChild('grid') grid: DataGridBComponent;

  public isReady: boolean = false;
  public data: any;

  get ds(): AppDataset {
    return this.dataSource.ActiveSource.appDataset;
  }

  ngOnInit(): void {
  }
  ngAfterViewInit() {
    //console.log("data:", this.data, ", host:", this.host);
    if (this.host) {
      const ids = this.host.surveys.filter(sv => sv.active);
      this._surveyIds = [];
      ids.forEach(item => {
        this._surveyIds.push(item.id);
      })
    }

  }

  get host(): FreespanComponent {
    if (!this.data) return null;
    return this.data.hostObject;
  }

  private _surveyIds: Array<number> = []
  get surveyIds(): Array<number> {
    // console.log("host:",this.host);
    return this._surveyIds;
  }

  RowClick(event: any) {
    // console.log("RowClick event: ", event, "\nSelected: ", this.grid.SelectedIds)
  }

}
