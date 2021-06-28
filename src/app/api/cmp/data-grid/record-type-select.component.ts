import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-record-type-select',
  templateUrl: './record-type-select.component.html',
  styleUrls: ['./record-type-select.component.scss'],
})
export class RecordTypeSelectComponent implements OnInit, AfterViewInit {
  public data: any;

  get form(): FormGroup {
    return this.data.form;
  }

  get options(): Array<any> {
    return this.data.recordTypeOptions
  }

  get errorMessage(): string {
    return this.form.value.errorMessage;
  }

  constructor() {}

  ngOnInit(): void {
    this.form.addControl('recordType', new FormControl(this.data.defaultValue));
    this.form.addControl('errorMessage', new FormControl(''));
    // this.form.addControl('validSelection',new FormControl(true));
  }
  ngAfterViewInit() {
    // this.data.recordType = 888;
    console.log('\nRecord type selection data: ', this.options);
  }

  SelectChange() {
    if (!this.form.value.recordType || this.form.value.recordType == -1) {
      this.form.patchValue({ errorMessage: 'Invalid type selection!' });
    } else {
      const opt = this.options.find((o) => o.key == this.form.value.recordType);
      console.log('\nSelected item: ', opt);
      this.form.patchValue({ errorMessage: '' });
    }
  }
}
