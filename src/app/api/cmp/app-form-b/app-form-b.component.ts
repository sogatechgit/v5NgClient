import { FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-form-b',
  templateUrl: './app-form-b.component.html',
  styleUrls: ['./app-form-b.component.scss']
})
export class AppFormBComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  private _testFormObject: FormGroup = null;
  public get testFormObject(): FormGroup {
    if (!this._testFormObject) this._testFormObject = new FormGroup({});
    return this._testFormObject;
  }

}
