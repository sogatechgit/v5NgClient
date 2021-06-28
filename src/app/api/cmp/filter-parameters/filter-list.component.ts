import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';

@Component({
  selector: 'app-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.scss']
})
export class FilterListComponent implements OnInit {
  @ViewChild('wrapper') wrapper:ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  get bound():any{
    if(!this.wrapper) return null;
    return this.wrapper.nativeElement.getBoundingClientRect()
  }


}
