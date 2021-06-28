import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-data-grid-split',
  templateUrl: './data-grid-split.component.html',
  styleUrls: ['./data-grid-split.component.scss']
})
export class DataGridSplitComponent implements OnInit {

  @Input() xPos:number = 0;
  @Input() gridHeight:number = 0;
  @Input() headerHeight:number = 22;

  public splitWidth = 4;

  constructor() { }

  ngOnInit(): void {
  }

}
