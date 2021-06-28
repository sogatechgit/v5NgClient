import { Component, OnInit, Input, ViewChild, Pipe } from '@angular/core';
import { Console } from 'node:console';


@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.scss']
})
export class ReportViewerComponent implements OnInit {

  public reporturl: string;

  @ViewChild('myframe') myframe: any;

  @Input() QryStr: string = '';


  @Input() set Reload(value: string) {
    
    setTimeout(() => {
      this.reporturl = value;
      this.myframe.nativeElement.src = this.reporturl;
      console.log("this.myframe.nativeElement.src: ", this.myframe.nativeElement.src)
    }, 1000)

  }

  constructor() { }

  ngOnInit(): void {

  }

  get Geturl(): string {
    return this.reporturl;
  }

}
