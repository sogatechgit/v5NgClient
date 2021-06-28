import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ContentChild,
  ContentChildren,
  TemplateRef,
  QueryList,
  HostListener,
  KeyValueDiffers,
  KeyValueDiffer,
} from '@angular/core';
import { PanelAComponent } from '../panel-a/panel-a.component';

@Component({
  selector: 'app-data-tabs',
  templateUrl: './data-tabs.component.html',
  styleUrls: ['./data-tabs.component.scss'],
})
export class DataTabsComponent implements OnInit, AfterViewInit {
  @HostListener('window:resize', ['$event']) handleResize(event: any) {
    // simply adding this event declaration, triggers recalculation of column widths
    // when the browser window is resized!
    // a method can also be called within this event handler...
    // this.RefreshGridDisplay();
    //
    // this.gridViewPort.checkViewportSize();
    // this.resetColumnWidths();
    // if (this.GRID_WRAPPER && this.details) {
    //   if(!this.details.form) return;
    //   const formWrapper = this.details.form.FORM_WRAPPER.nativeElement;
    //   const newGridHeight =
    //     this.GRID_WRAPPER.nativeElement.offsetHeight - formWrapper.offsetHeight;
    //   // this.details.tabHeight = newGridHeight - 30;
    //   this.gridHeight = newGridHeight + 14;
    // }

    // if(this.totalTabWidth==0){
    //   this.CalcTotalWidth()
    // }

    this.CalcTotalWidth();

    // console.log(
    //   '\n',
    //   this.owner,
    //   'this.tabWrapper: ',
    //   this.tabWrapper.offsetWidth,
    //   ', tabs:',
    //   this.tabs.offsetWidth,
    //   ', scrolling:',
    //   this.scrolling,
    //   ', total tab width',
    //   this.totalTabWidth,
    //   ', this.lis',
    //   this.lis,
    //   ', this.lis.length',
    //   this.lis.length,
    //   ', this.tabs.offsetWidth < this.totalTabWidth + 35:',
    //   this.tabs.offsetWidth < this.totalTabWidth + 35,
    //   ', this.tabs.offsetWidth:',this.tabs.offsetWidth
    // );
  }

  @Input() tabClass: string = null;
  @Input() withClose: boolean = false;
  @Input() owner: string = 'none';
  @Input() name: string = 'data_tab';
  private _options: DataTabsOption;
  @Input() set options(value: DataTabsOption) {
    this._options = value;
    //setTimeout(()=>this.CalcTotalWidth())
  }
  get options(): DataTabsOption {
    return this._options;
  }

  @Input() fontFactor: number = 1;

  @Input() height: number = -1;

  private _fluid: boolean = false;
  @Input() set fluid(value: boolean) {
    this._fluid = value;
  }
  get fluid(): boolean {
    if (this.fluidIds.length == 0) {
      return this._fluid;
    } else {
      const id: number = this.activeTab ? this.activeTab.id : -1;
      if (id == -1) return this._fluid;
      return this.fluidIds.indexOf(id) != -1;
    }


  }

  @Input() fluidIds: Array<number> = [];

  @Input() activeForeground: string = null;
  @Input() activeBackground: string = null;
  @Input() panelBackground: string = 'white';

  @Input() set tabLabels(value: string) {
    const opts = new DataTabsOption([]);
    const labels = value.split(',');
    let ctr: number = 0;
    const withActive: boolean =
      value.startsWith('@') || value.indexOf(',@') != -1;
    labels.forEach((L) => {
      const withActiveSymbol = L.startsWith('@');

      let labelArr: Array<string> = (withActiveSymbol ? L.substr(1) : L).split(
        '|'
      );
      const withId = labelArr.length != 1;

      const id = withId ? +labelArr[0] : ctr;
      const label = labelArr[withId ? 1 : 0];
      const active = ctr == 0 && !withActive ? true : withActiveSymbol;

      opts.AddTab({ id: id, label: label, active: active });
      ctr++;
    });
    this.options = opts;
    this.initialized = true;
  }

  @Output() tabClicked: EventEmitter<any> = new EventEmitter();
  @Output() tabClosed: EventEmitter<any> = new EventEmitter();

  @ViewChild('tabWrapper') tabWrapperObj: any;
  tabWrapper: HTMLElement = null;
  @ViewChild('tabs') tabsObj: ElementRef;
  tabs: HTMLElement = null;

  @ContentChild(TemplateRef) tabContent: TemplateRef<any>;
  @ContentChildren(PanelAComponent) panels: QueryList<PanelAComponent>;

  differ: KeyValueDiffer<string, any>;
  constructor(private differs: KeyValueDiffers) {
    this.differ = this.differs.find({}).create();
  }

  ngOnInit(): void {
    this.initialized = true;
  }

  public initialized: boolean = false;
  private lis: any;
  private totalTabWidth: number = 0;

  ngAfterViewInit() {
    this.tabWrapper = this.tabWrapperObj.nativeElement;
    this.tabs = this.tabsObj.nativeElement;

    // this.CalcTotalWidth();
    // this.handleResize(null);
  }

  ngDoCheck() {
    const change = this.differ.diff(this);
    let process: boolean = false;
    if (change) {
      change.forEachChangedItem((item) => {
        const key = item.key;
        // if(key=='tabWrapper'){
        //   this.totalTabWidth = 0;
        // }
        // switch (key) {
        //   case '_DataSet':
        //   case '_TableCode':
        //   case '_TableCodeSub':
        //     this.SetupSources();
        //     break;
        //   case '_dataKeyValue':
        //     this.Requery();
        //     break;
        //   case '_sourceRow':
        //     this.ScatterData();
        //     break;
        //   case '_sourceRowSub':
        //     this.ScatterDataSub();
        //     break;
        //   default:
        //     break;
        // }
      });
    }
  }
  public get dataTabHeight(): number {
    if (!this.initialized || this.height != -1 || !this.tabWrapper)
      return this.height != -1 ? this.height : 100;
    // if(this.tabWrapper.parentElement.offsetHeight)console.log("\nthis.tabWrapper.parentElement:",this.tabWrapper.parentElement.offsetHeight,this.tabWrapper.parentElement.parentElement.offsetHeight,this.tabWrapper.parentElement.parentElement.parentElement.offsetHeight)
    return this.tabWrapper.parentElement.parentElement.offsetHeight;
  }

  public get activeTab(): any {
    if (!this.options) return null;
    return this.options.tabs.find((t) => t.active);
  }

  public closeTab(tab: DataTab) {
    this.tabClosed.emit(tab);
    this.CalcTotalWidth();
  }

  TabClicked(tab: DataTab) {
    //
    // if (this.activeTab) {
    //   this.activeTab.active = false;
    //   // if (this.activeTab.panel) this.activeTab.panel.isVisible = false;
    //   //console.log('this.activeTab', this.activeTab,this.options.tabs);
    // }
    const active = this.options.tabs.find((t) => t.active);
    if (active) {
      active.active = false;
      if (active.panel) active.panel.isVisible = false;
    }
    tab.active = true;
    if (tab.panel) tab.panel.isVisible = true;

    const btn = document.querySelector('#t_' + tab.id) as HTMLElement;
    if (btn) btn.blur();

    this.tabClicked.emit(tab);
  }

  CalcTotalWidth() {
    if (!this.tabs) return;
    this.totalTabWidth = 0;
    this.lis = this.tabs.querySelectorAll('li');
    let ctr: number = 1;
    this.lis.forEach((li) => {
      if (ctr >= this.lis.length) return;
      ctr++;
      this.totalTabWidth += li.offsetWidth;
    });
  }

  public get scrolling(): boolean {
    if (!this.tabs) return false;
    // if (!this.tabWrapper || !this.tabs) return false;
    return this.tabs.offsetWidth < this.totalTabWidth + 35;
    // return this.tabWrapper.offsetWidth < this.totalTabWidth + 35;
  }

  public get leftScroll(): boolean {
    if (!this.lis) return false;
    const on = this.scrolling && this.tabs.scrollLeft > 0;
    if (!on) this._hiddenIndex = 0;
    return on;
  }
  public get rightScroll(): boolean {
    if (!this.lis) return false;
    const on = this.scrolling && this._hiddenIndex < this.lis.length;
    return on;
  }

  private _hiddenIndex = 0;
  public get hiddenIndex(): number {
    return this._hiddenIndex;
  }
  LeftScroll(toStart?: boolean) {
    if (this._hiddenIndex == 0) return;
    if (toStart) {
      this._hiddenIndex = 0;
      this.tabs.scrollLeft = 0;
      return;
    }
    const li = this.lis[this._hiddenIndex - 1];

    this._hiddenIndex--;
    // this.tabWrapper.scrollLeft = (li.offsetWidth + li.offsetLeft)
    //this.tabs.scrollLeft = (li.offsetWidth + li.offsetLeft)
    if (li) {
      // console.log("\nlist:",li,this._hiddenIndex,li.offsetLeft,li.offsetWidth);
      this.tabs.scrollLeft -= li.offsetWidth;
    } else {
      console.log('\nlist not found!!!');
    }
  }

  RightScroll(toEnd?: boolean) {
    // console.log(this.tabs.length)
    //lis.forEach((li) => (this.totalTabWidth += li.offsetWidth));
    // console.log("\nthis._hiddenIndex",this._hiddenIndex);
    if (toEnd) {
      this._hiddenIndex = this.lis.length;
      this.tabs.scrollLeft = this.totalTabWidth;
      return;
    }

    if (this._hiddenIndex >= this.lis.length) return;

    this._hiddenIndex++;
    const li = this.lis[this._hiddenIndex - 1];
    // this.tabWrapper.scrollLeft = (li.offsetWidth + li.offsetLeft)
    //this.tabs.scrollLeft = (li.offsetWidth + li.offsetLeft)
    const oldLeft = this.tabs.scrollLeft;

    if (li) {
      this.tabs.scrollLeft += li.offsetWidth;
      if (oldLeft == this.tabs.scrollLeft) this._hiddenIndex = this.lis.length;
      // console.log("\nlist:",li,this._hiddenIndex,this.tabs.scrollLeft,this.totalTabWidth,this.tabs.scrollWidth);
    } else {
      console.log('\nlist not found!!!');
    }
  }

  public isActive(tabId: number): boolean {
    if (!this.initialized) return true;

    const tab = this.activeTab;
    if (!tab) return false;
    return tab.id == tabId;
  }

  public a(tabId: number): boolean {
    return this.isActive(tabId);
  }
  public V(tabId: number): string {
    return this.isActive(tabId) ? 'visible' : 'hidden';
  }
  public Z(tabId: number): number {
    return this.isActive(tabId) ? 3 : 1;
  }
  public L(tabId: number): boolean {
    return true;
  }
}

export interface IDataTab {
  id?: number;
  label?: string;
  toolTip?: string;
  icon?: string;
  active?: boolean;
  loaded?: boolean;
  order?: number;
  parentOption?: DataTabsOption;
  withClose?: boolean;
  panel?: PanelAComponent;
}

export class DataTab {
  constructor(args: IDataTab) {
    let {
      id,
      label,
      toolTip,
      icon,
      active,
      loaded,
      order,
      withClose,
      parentOption,
      panel,
    } = args;

    this.id = id;
    this.label = label;
    this.icon = icon ? icon : '';
    this.active = active ? active : false;
    this.toolTip = toolTip ? toolTip : '';
    this.withClose = withClose ? withClose : false;
    this.order = order;
    this.loaded = loaded;
    this.parentOption = parentOption;
    this.panel = panel;
  }
  public id?: number;
  public label?: string;
  public toolTip?: string;
  public icon?: string;
  public active?: boolean;
  public loaded?: boolean;
  public order?: number;
  public withClose?: boolean;
  public parentOption?: DataTabsOption;
  public panel?: PanelAComponent;
}

export class DataTabsOption {
  constructor(public tabs: Array<DataTab>, args?: {}) {
    if (args != undefined) {
      // set other properties
    }
  }

  private _tabsIndices: Array<number> = [];
  public AddTab(args: IDataTab): DataTabsOption {
    // the next 3 lines prevents re-creation of tab element if
    // the tab id is already recorded in _tabIndices
    const id = args.id;
    const tabIdx = this._tabsIndices.indexOf(id);
    if (tabIdx != -1) {
      if (args.active != undefined) this.tabs[tabIdx].active = args.active;
      return;
    }
    this._tabsIndices.push(id);

    const tab = new DataTab(args);

    tab.parentOption = this;
    tab.order = this.tabs.length;
    tab.order = args.order ? args.order : this.tabs.length;

    this.tabs.push(tab);

    return this;
  }

  public Clear(): void {
    while (this.tabs.length != 0) {
      this.RemoveTab(this.tabs[0].id);
    }
  }

  public RemoveTab(tabId: number): void {
    if (this.tabs.length == 0) return;
    let idx: number = this.tabs.findIndex((t) => t.id == tabId);
    if (idx != -1) {
      this.tabs.splice(idx, 1);
      idx = this._tabsIndices.indexOf(tabId);
      if (idx != -1) this._tabsIndices.splice(idx, 1);
    }
  }

  public get activeTab(): DataTab {
    if (!this.tabs) return null;
    return this.tabs.find((t) => t.active);
  }
}
