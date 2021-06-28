import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
})
export class PromptComponent implements OnInit {
  constructor() {}

  public showMessage:boolean = true;

  @Input() data: any = null;

  get message(): string {
    let ret: string = 'No message defined';
    if (this.data) if (this.data.message) ret = this.data.message;
    return ret;
  }

  get icon():string{
    if (!this.data) return;
    return this.data.icon;
  }
  get iconColor():string{
    if (!this.data) return 'black';
    return this.data.icon_color ? this.data.icon_color : 'black';
  }

  ngOnInit(): void {}
}
