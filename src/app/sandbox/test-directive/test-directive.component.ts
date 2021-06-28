import { Component, OnInit,ViewChild } from '@angular/core';
import { TestDirective } from './testdir.directive'

@Component({
  selector: 'app-test-directive',
  templateUrl: './test-directive.component.html',
  styleUrls: ['./test-directive.component.scss']
})
export class TestDirectiveComponent implements OnInit {
  @ViewChild(TestDirective, {static: true}) host: TestDirective;
  constructor() { }

  ngOnInit(): void {
    console.log("TestHost:",this.host)
  }

}
