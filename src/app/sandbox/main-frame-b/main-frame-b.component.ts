import { AppDataset } from './../../svc/app-dataset.service';
import { AppMainServiceService } from './../../svc/app-main-service.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TreeViewComponent, TreeViewNode} from 'src/app/api/cmp/tree-view/tree-view.component';

@Component({
  selector: 'app-main-frame-b',
  templateUrl: './main-frame-b.component.html',
  styleUrls: ['./main-frame-b.component.scss'],
})
export class MainFrameBComponent implements OnInit, AfterViewInit {
  @ViewChild('mainTree') treeView: TreeViewComponent;

  constructor(public dataSource: AppMainServiceService) {}

  get ds(): AppDataset {
    return this.dataSource.ActiveSource.appDataset;
  }
  get CurrentTreeNode(): TreeViewNode {
    if (!this.ds) return null;
    return this.ds.mainTreeCurrentNode;
  }

  navWidth: number = 300;

  ngOnInit(): void {}

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
    if (this.ds.isAuthenticated) {
      this.ds.GetTreeData({
        treeView: this.treeView,
        onSuccess: (result) => {
          this.treeView.ProcessTree();
          this.treeView.gotoTopNode();
        },
      });
    }

    this.KeepAlive((data)=>{
      this.SecondsUpdate();
    });

  }

  private _KeepAlive: any;
  KeepAlive(onSuccess?:Function) {
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

          // console.log('\nSuccess on keeping alive! ' + this.ds.dateStampString, data);
          if(onSuccess) onSuccess();
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
    const minSecs = 60 * 1000;
    const mins = .05;
    setTimeout(() => {
      this.KeepAlive();
    }, mins * minSecs);
  }

  SecondsUpdate(){
    setTimeout(() => {
      this.ds.SetCurrentServerTime();
      this.SecondsUpdate();
    }, 1000);

  }

}
