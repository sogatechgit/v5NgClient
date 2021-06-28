import { AppDataset } from './../../svc/app-dataset.service';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-landing',
  templateUrl: './app-landing.component.html',
  styleUrls: ['./app-landing.component.scss']
})
export class AppLandingComponent implements OnInit {

  constructor(private dataSource: AppMainServiceService ) { }

  get ds():AppDataset{
    return this.dataSource.ActiveSource.appDataset;
  }

  ngOnInit(): void {
  }

}
