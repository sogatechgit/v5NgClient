import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-toolbar-button',
  templateUrl: './toolbar-button.component.html',
  styleUrls: ['./toolbar-button.component.scss'],
})
export class ToolbarButtonComponent implements OnInit {
  @ViewChild('wrapper') wrapper: ElementRef

  @Input() iconRight:string = 'fa fa-caret-down'
  @Input() rightIconMenuTrigger:any=null;
  
  @Input() withDropdown:boolean = false;
  @Input() rights: any;
  @Output() buttonClick: EventEmitter<any> = new EventEmitter();
  @Output() toggleDropDownState: EventEmitter<any> = new EventEmitter();

  @Input() inProgress: boolean = false;
  @Input() tooltip: string = '';
  @Input() icon: string = '';
  @Input() icon2: string = '';
  @Input() fontFactor: number = 0.95;

  @Input() on: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  ButtonClick(e: any) {
    this.buttonClick.emit(e);
  }

  onFocus(e: any) {
    e.srcElement.blur();
  }

  get isVisible(): boolean {
    if (this.on) return true;
    return this.rights != undefined;
  }

  get bound():any{
    if(!this.wrapper) return null;
    return this.wrapper.nativeElement.getBoundingClientRect()
  }

  private _dropDownMouseEvent: any;
  get dropDownMouseEvent():any{
    return this._dropDownMouseEvent
  }

  private _dropDownState: boolean = false;
  get dropDownState(): boolean {
    return this._dropDownState;
  }
  ToggleDropDownState(e: any) {
    this._dropDownMouseEvent = e;
    this._dropDownState = !this._dropDownState;
    if (this.toggleDropDownState.observers.length)
      this.toggleDropDownState.emit({
        e: e,
        sender: this,
      });
  }
}
