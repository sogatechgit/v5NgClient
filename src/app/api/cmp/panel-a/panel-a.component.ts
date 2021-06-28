import { DataTab, DataTabsOption } from './../data-tabs/data-tabs.component';
import { WrapperAComponent } from './../wrapper-a/wrapper-a.component';
import { FormGroup } from '@angular/forms';
import { AppFormAComponent } from './../app-form-a/app-form-a.component';
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  AfterViewInit,
  ContentChildren,
  QueryList,
  Inject,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-panel-a',
  templateUrl: './panel-a.component.html',
  styleUrls: ['./panel-a.component.scss'],
})
export class PanelAComponent implements OnInit, AfterViewInit {
  @Input() horizontal: boolean = false;
  @Input() bgcolor: string = 'white';

  @Input() labelWidth: number = -1;
  @Input() inputWidth: number = -1;
  @Input() rowSpacing: number = -1;

  // panel margins
  @Input() MX: number = -1;
  @Input() MY: number = -1;
  @Input() MT: number = -1;
  @Input() MB: number = -1;
  @Input() ML: number = -1;
  @Input() MR: number = -1;

  // panel paddings
  @Input() P: number = -1;
  @Input() PX: number = -1;
  @Input() PY: number = -1;
  @Input() PT: number = -1;
  @Input() PB: number = -1;
  @Input() PL: number = -1;
  @Input() PR: number = -1;

  @Input() isVisible: boolean = true;

  @Input() useSubSource: boolean = false;
  @Input() insertWrapper: boolean = false;
  @Input() activeTab: number = 0;

  @Input() LPL: number = -1; // labelPaddingLeft inheritted by InputA component
  @Input() LPR: number = -1; // labelPaddingRight inheritted by InputA component

  @Input() width: number = null;

  // Tab inputs and outputs
  // private _DataTabsOption: DataTabsOption = null;
  // get dataTabsOption(): DataTabsOption {
  //   if (!this._DataTabsOption) return null;
  //   return this._DataTabsOption;
  // }

  @Input() tabControl:boolean = false;

  @Input() tabDef: DataTab = {};

  @Input() fluidTab: boolean = false;
  @Input() tabBackground: string = 'white';

  @Input() readOnly: boolean;

  @Output() tabClicked: EventEmitter<any> = new EventEmitter();
  @Output() tabClosed: EventEmitter<any> = new EventEmitter();

  // @Input() form:AppFormAComponent = null;
  //[style.min-width.px]="400" [style.max-width.px]="400"

  // @ContentChildren(PanelAComponent) panels: QueryList<PanelAComponent>;

  private _ready: boolean = false;
  public get ready(): boolean {
    return this._ready;
  }

  // public get withTabs(): boolean {
  //   // return false;
  //   if (!this._ready) return false;
  //   return this._DataTabsOption != null;
  // }

  // public get withTabs(): boolean {
  //   if (this.panels.length == 0) return false;

  //   if (!this._DataTabsOption) {
  //     if (this.panels.length) {
  //       if (this.panels.toArray()[0].tabDef.id != undefined) {
  //         const tabOptions = new DataTabsOption([]);
  //         if (this.panels.toArray()[0].tabDef.label) {
  //           this.panels.forEach((p) => {
  //             tabOptions.AddTab(p.tabDef);
  //           });
  //         }
  //         this._DataTabsOption = tabOptions;
  //       }
  //     }
  //   }

  //   return this._DataTabsOption != null;
  // }

  private _initializing: boolean = true;
  public isActive(tabId: number): boolean {
    return this.activeTab == tabId || this._initializing;
  }

  public get isTabPage(): boolean {
    return this.tabDef.id != undefined;
  }

  constructor(
    @Inject(AppFormAComponent) public form: AppFormAComponent,
    public elem: ElementRef
  ) {}

  ngOnInit(): void {
    // [style.width.px]="Width"
    this.elem.nativeElement.style.minWidth = `${this.Width}px`;
    this.elem.nativeElement.style.maxWidth = `${this.Width}px`;
    //[style.min-width.px]="400" [style.max-width.px]="400"
  }

  ngAfterViewInit() {
    // this.CreateTabs();
    // setTimeout(()=>{
    //   this.panels.forEach(p=>{
    //     p.form = this.form;
    //     // console.log("\ntab label:",p.tabLabel,", form",this.form);
    //   })
    // },500)
    // if (this.panels.length) {
    //   console.log('\nthis.panels[0]:', this.panels.toArray());
    //   if (this.panels.toArray()[0].tabLabel) {
    //     this.panels.forEach((p) => {
    //       // p.form = this.form;
    //       if (p.tabLabel) console.log('\ntab label:', p.tabLabel);
    //     });
    //   }
    // }
    // to hide tabs
    // this._initializing = false;
    // setTimeout(() => {
    //   this._initializing = false;
    // }, 3000);
    // this.panels.forEach((p) => {
    //   // p.form = this.form;
    //   //if(p.tabLabel)console.log("\ntab label:",p.tabLabel,", form",this.form);
    // });
  }

  // CreateTabs() {
  //   if (this.panels.length) {
  //     const tabOptions = new DataTabsOption([]);
  //     if (this.panels.toArray()[0].tabDef.label) {
  //       this.panels.forEach((p) => {
  //         tabOptions.AddTab(p.tabDef);
  //       });
  //     }
  //     this._DataTabsOption = tabOptions;
  //     console.log('\n****** Panel tabs', this._DataTabsOption);
  //   }
  //   this._initializing = false;
  //   this._ready = true;
  //   setTimeout(() => {
  //     this._ready = true;
  //   }, 1000);
  // }

  TabClicked(tab: DataTab) {
    // this method will be overridden
    // in the derived form
    this.tabClicked.emit(tab);
  }

  public get MarginTop(): number {
    return this.MT != -1 ? this.MT : this.MY != -1 ? this.MY : null;
  }
  public get MarginBottom(): number {
    return this.MB != -1 ? this.MB : this.MY != -1 ? this.MY : null;
  }
  public get MarginLeft(): number {
    return this.ML != -1 ? this.ML : this.MX != -1 ? this.MX : null;
  }
  public get MarginRight(): number {
    return this.MR != -1 ? this.MR : this.MX != -1 ? this.MX : null;
  }

  public get PaddingTop(): number {
    return this.P!=-1 ? this.P : (this.PT != -1 ? this.PT : this.PY != -1 ? this.PY : null);
  }
  public get PaddingBottom(): number {
    return this.P!=-1 ? this.P : (this.PB != -1 ? this.PB : this.PY != -1 ? this.PY : null);
  }
  public get PaddingLeft(): number {
    return this.P!=-1 ? this.P : (this.PL != -1 ? this.PL : this.PX != -1 ? this.PX : null);
  }
  public get PaddingRight(): number {
    return this.P!=-1 ? this.P : (this.PR != -1 ? this.PR : this.PX != -1 ? this.PX : null);
  }

  public get Width(): number {
    return this.width;
  }

  public get formObject(): FormGroup {
    if (!this.form) return null;
    return this.useSubSource ? this.form.formObjectSub : this.form.formObject;
  }
  public get sourceRow(): any {
    if (!this.form) return null;
    return this.useSubSource ? this.form.sourceRowSub : this.form.sourceRow;
  }
  public get sourceTable(): any {
    if (!this.form) return null;
    return this.useSubSource ? this.form.sourceTableSub : this.form.sourceTable;
  }

  public get RowSpacing(): number {
    if (this.rowSpacing != -1) return this.rowSpacing;
    if (this.rowSpacing == -1 && this.form != null) {
      return this.form.rowSpacing;
    } else if (this.rowSpacing == -1) {
      return 2;
    } else {
      return null;
    }
  }

  public get LabelWidth(): number {
    if (this.labelWidth != -1) return this.labelWidth;
    if (this.labelWidth == -1 && this.form != null) {
      return this.form.labelWidth;
    } else if (this.labelWidth == -1) {
      return 120;
    } else {
      return null;
    }
  }
}
