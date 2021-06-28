import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-progress-mask',
  templateUrl: './progress-mask.component.html',
  styleUrls: ['./progress-mask.component.scss'],
})
export class ProgressMaskComponent implements OnInit {
  private _message: string = 'Loading records. Please wait...';
  @Input() set message(value: string) {
    this._message = value;
  }
  get message(): string {
    return this._message;
  }
  @Input() icon: string = 'fa fa-sync fa-spin fa-1x fa-fw';
  @Input() maskColor: string = 'black';
  @Input() maskOpacity: number = 0.04;
  @Input() msgColor: string = '#17a2b8';
  // @Input() msgBackColor: string = '#eae0c8';
  @Input() msgBackColor: string = 'white';
  @Input() icoColor: string = this.msgColor;
  // @Input() icoColor: string = '#6c757d';
  // @Input() msgColor: string = '#dc3545';
  // @Input() msgColor: string = '#6c757d';
  @Input() fontFactor: number = 1.15;

  @Input() ProgressDisplaySingle:string;

  constructor() {}

  ngOnInit(): void {}
}
