import { FileUploaderComponent } from './../../api/cmp/file-uploader/file-uploader.component';
import {
  DataTab,
  DataTabsComponent,
} from 'src/app/api/cmp/data-tabs/data-tabs.component';
import { AppDataset } from './../../svc/app-dataset.service';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  TreeViewComponent,
  TreeViewNode,
} from './../../api/cmp/tree-view/tree-view.component';
import { IAppVer } from './../../api/mod/app-params.model';

@Component({
  selector: 'app-main-frameset',
  templateUrl: './main-frameset.component.html',
  styleUrls: ['./main-frameset.component.scss'],
})
export class MainFramesetComponent implements OnInit, AfterViewInit {
  @ViewChild('fileUploader') fileUploader: FileUploaderComponent;
  @ViewChild('mainTree') treeView: TreeViewComponent;
  @ViewChild('t') mainTabs: DataTabsComponent;

  constructor(public dataSource: AppMainServiceService) { }

  public menuList: Array<any> = this.ds ? this.ds.menuList : [];
  public get subMenu(): Array<any> {
    const menu = this.activeMenu;
    if (!menu) return [];
    if (!menu.subMenu) return [];
    return menu.subMenu;
  }

  public get activeMenu(): any {
    return this.menuList.find((e) => e.active);
  }

  menuLabel(menuItem: any): string {
    const lbl = menuItem.label;
    if (lbl == 'user-info') {
      return this.ds.userInfo
        ? `Hi ${this.ds.userInfo.name} ${this.ds.userInfo.id ? `[${this.ds.userInfo.id}]` : ''
        }`
        : 'Visitor';
    } else {
      return menuItem.label;
    }
  }
  public get activeSubMenu(): any {
    return this.subMenu.find((e) => e.active);
  }

  public menuClick(menuId: number) {
    const menu: any = this.activeMenu;
    let changeMenu: boolean = false;

    if (menu) {
      if (menu.id != menuId) {
        menu.active = false;
        changeMenu = true;
      }
    } else {
      changeMenu = true;
    }
    if (changeMenu) {
      const mnu = this.menuList.find((e) => e.id == menuId);
      mnu.active = true;
      // mnu.loaded = true;
    }

    const subm = this.subMenu;
    if (subm.length) {
      if (!subm.find((e) => e.active)) subm[0].active = true;
    }

    // reset tab
    setTimeout(() => {
      this.setTablLabels();
    }, 100);
  }
  TabClicked(tab: DataTab) {
    this.subMenuClick(tab.id);
  }

  TabClosed(tab: DataTab): void {
    const loaded: Array<DataTab> = this.loadedTabs;

    const mnu = this.subMenu.find((mnu) => mnu.id == tab.id);
    let newActive: number = null;
    if (mnu) {
      if (mnu.active) {
        if (loaded.length > 1) {
          // need to set new active tab
          const idx: number = loaded.findIndex((t) => t.id == tab.id);
          if (idx != -1) {
            if (idx == loaded.length - 1) {
              // last element
              newActive = loaded[loaded.length - 2].id;
            } else if (idx == 0) {
              // first element, set next element as active
              newActive = loaded[1].id;
            }
          }
        }
      }

      mnu.active = false;
      mnu.loaded = false;

      if (newActive) this.subMenuClick(newActive);

      this.setTablLabels(tab);
    } else {
      console.log('\nNo menu item equvalent to tab found!');
    }

    return;

    if (tab.active) {
      // set active module
      const activeSubMenu = this.activeSubMenu;
      if (activeSubMenu) activeSubMenu.active = false;

      // if (this.mainTabsOptions.tabs.length > 1) {
      //   const tabIndex = this.mainTabsOptions.tabs.indexOf(tab);
      //   console.log('TAB INDEX:', tabIndex);
      //   newTabIndex = tabIndex + (tabIndex ? -1 : 0);
      // }
    }
    this.setTablLabels();
  }

  get loadedTabs(): Array<DataTab> {
    if (!this.mainTabs) return [];
    if (!this.mainTabs.options) return [];
    return this.mainTabs.options.tabs;
  }

  isLoaded(id: number): boolean {
    const mnu = this.subMenu.find((m) => m.id == id);
    if (!mnu) return false;
    return mnu.loaded;
  }

  public subMenuClick(menuId: number) {
    const subm = this.subMenu;
    const activeMenu: any = subm.find((e) => e.active);
    let changeMenu: boolean = false;
    if (activeMenu) {
      if (activeMenu != menuId) {
        activeMenu.active = false;
        changeMenu = true;
      }
    } else {
      changeMenu = true;
    }
    if (changeMenu) {
      const mnu = subm.find((e) => e.id == menuId);
      mnu.active = true;
      mnu.loaded = true;
    }
    setTimeout(() => {
      this.setTablLabels();
    }, 100);

    // setTimeout(() => {
    //   this.SetupDetailsData(true);
    //   this.SetupDetailsTab();
    // }, 1);
  }

  public tabLabels: string = '';
  private setTablLabels(exclude?: DataTab): void {
    let tmpLabels: Array<string> = [];

    const processed: Array<number> = [];
    const loaded: Array<DataTab> = this.loadedTabs;

    loaded.forEach((tab: DataTab) => {
      if (exclude) if (exclude.id == tab.id) return;
      const mnu = this.subMenu.find((m) => m.id == tab.id);
      if (mnu) {
        processed.push(tab.id);
        tmpLabels.push(`${mnu.active ? '@' : ''}${mnu.id}|${mnu.label}`);
      }
    });

    this.subMenu.forEach((mnu) => {
      if (mnu.loaded && processed.indexOf(mnu.id) == -1)
        tmpLabels.push(`${mnu.active ? '@' : ''}${mnu.id}|${mnu.label}`);
    });
    this.tabLabels = tmpLabels.length ? tmpLabels.join(',') : '';
  }

  Logout() {
    if (!this.ds) return;
    this.ds.Logout();
  }

  public get notificationTip(): string {
    const withError = this.ds.globalMessage['error'] == true;
    if (withError) return this.ds.globalMessage['message'];
    return null;
    //ds.globalMessage['message']
  }
  get ds(): AppDataset {
    return this.dataSource.ActiveSource.appDataset;
  }

  public get isAuthenticated(): boolean {
    return this.ds.isAuthenticated;
  }
  get CurrentTreeNode(): TreeViewNode {
    if (!this.ds) return null;
    return this.ds.mainTreeCurrentNode;
  }

  menuClass(m: any): any {
    //[class]="m.icon + ' mr-1 noselect' + (isAuthenticated ? (m.active ? ' active' : '') : ' disabled')"
    const ret: Array<string> = [
      'noselect',
      !this.isAuthenticated ? 'disabled' : '',
    ];

    if (m.icon) {
      ret.push('mr-1');
      ret.push(m.icon);
      // ret['mr-1'] = true;
      // const iArr = m.icon.split(' ');
      //console.log("\nIcon:" ,m.icon,iArr)
      // iArr.forEach((i) => ret.push(i));
    }

    console.log('\nMenuClass: ', ret.join(' '));

    return ret.join(' ');
  }
  subMenuClass(s: any): any {
    // [class]="'disabled noselect' + (isAuthenticated ? (s.active ? ' active' : '') : ' disabled')"
    return { noselect: true };
  }

  navWidth: number = 300;

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.InitComponent();
  }

  _NodePath: string = '-';
  get NodePath(): string {
    //if (!this.treeView) return this._NodePath;
    // using setTimeout suppresses the ExpressionChangedAfterItHasBeenCheckedError

    // USING THE METHOD ON THE NEXT LINE WILL SIGNIFICANTLY SLOW DOWN
    // THE SYSTEM!!!!
    //setTimeout(()=>{this._NodePath = this.treeView.NodePath;},0);

    return this._NodePath;
  }

  TreeClick(n: TreeViewNode) {
    this.ds.mainTreeCurrentNode = n;
    this._NodePath = this.treeView.NodePath;
    // console.log('this._NodePath:', this._NodePath, n);
  }

  TreePMClick(e: any) {
    if (!e.options.childNodesMissing) return;

    this.ds.GetTreeData({
      treeView: this.treeView,
      parentNode: e.node,
      onSuccess: (result) => {
        e.node.exp = true;
        this.treeView.ProcessTree();
      },
    });
  }

  InitComponent(): void {
    console.log('\nInitComponent....');
    if (true) {
      this.ds.GetTreeData({
        treeView: this.treeView,
        onSuccess: (result) => {
          this.treeView.ProcessTree();
          this.treeView.gotoTopNode();
          if (this.fileUploader) this.ds.fileUploader = this.fileUploader;
        },
      });
    }

    this.KeepAlive((data) => {
      this.SecondsUpdate();
    });
  }

  NotifyClick() {
    if (!this.ds) return;
    if (!this.ds.fileUploader) {
      this.ds.openSnackBar('File uploader not initialized!', 'x', 5000);
      return;
    }
    this.ds.fileUploader.show();
  }

  public get appVer(): IAppVer {
    //if (!this.ds) return { label: '', tipText: '' };
    const ver = this.ds.appVersionObject;
    let tip: string = '';
    let ctr: number = 1;
    ver.updates.forEach((u) => {
      tip += (tip ? '\n' : '') + (ctr + '. ') + u;
      ctr++;
    });
    let ret: IAppVer = {
      label: '(' + ver.ver + ' - ' + ver.build + ')',
      tipText: tip,
    };
    //
    //return "(Alpha 1.2.1-20200528)"
    return ret;

    // return "(Alpha 1.2.0-20200528)"
  }

  private _KeepAlive: any;
  KeepAlive(onSuccess?: Function, runOnce?: boolean) {
    // console.log("KeepAlive: ",new Date())
    this.ds.Get(
      [
        {
          code: 'chgTrack',
          key: '0',
          keyField: 'TRK_ID',
          forceRequest: true,
        },
      ],
      {
        onSuccess: (data) => {
          //console.log('\nSuccess on keeping alive! ', this.ds.csInfo, data);
          if (onSuccess) onSuccess(data);
        },
        onError: (err) => {
          console.log(
            '\nError on keeping alive! ' + this.ds.dateStampString,
            err
          );
        },
      }
    );

    // set interval of 10 mins to keep api component running
    if (!runOnce) {
      const minSecs = 60 * 1000;
      const mins = 5;
      setTimeout(() => {
        this.KeepAlive();
      }, mins * minSecs);
    }
  }

  SecondsUpdate() {
    setTimeout(() => {
      this.ds.SetCurrentServerTime();
      this.SecondsUpdate();
    }, 1000);
  }
}
