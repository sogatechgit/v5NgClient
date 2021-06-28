import {
  TreeViewComponent,
  TreeViewNode,
} from './../../api/cmp/tree-view/tree-view.component';
import { AppDataset } from './../../svc/app-dataset.service';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.scss'],
})
export class LocationSelectorComponent implements OnInit, AfterViewInit {
  @ViewChild('mainTree') treeView: TreeViewComponent;
  constructor() {}
  public data: any;

  ngOnInit(): void {}

  ngAfterViewInit() {
    //this.data.currentLocation = '';
    if (this.treeData.length == 0)
      // call common GetTreeData function to get data from the server
      this.ds.GetTreeData({
        treeView: this.treeView,
        onSuccess: (result) => {
          if (!this.data.currentLocation) this.treeView.ProcessTree();
        },
        //SetCurrentNode
      });
    else {
      // tree data is available. no need tp initialize
      setTimeout(() => {
        // refresh tree
        if (!this.data.currentLocation) this.treeView.ProcessTree();
      }, 50);
    }

    // data.currentLocation is supplied, call SetCurrentNode of the treeView component
    if (this.data.currentLocation) {
      // this.treeView.ProcessTree();
      this.treeView.SetCurrentNode(this.data.currentLocation, this.treeView);
      // setTimeout(() => {
      //   console.log('SetCurrentNode location selector...',this.data.currentLocation)
      //   // this.treeView.SetCurrentNode(this.data.currentLocation, this.treeView);
      //   this.treeView.SetCurrentNode('aa', this.treeView);
      //   //setTimeout(()=>this.treeView.SetCurrentNode('aa', this.treeView),50)
      // }, 50);
    }
  }

  public get ds(): AppDataset {
    if (!this.data) return null;
    return this.data.dataSet;
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

  TreeClick(e: any) {
    // assign TreeViewNode data to the response property of the common popup component
    const node = e;
    let ret: any = null;
    if (node)
      ret = {
        id: node.id,
        code: node.code,
        text: node.text,
        dataId: node.did,
        location: node.loc,
      };
    // this.popUp.data.response = ret;

    this.data.treeView = this.treeView;
    this.data.selectedNode = this.treeView.currNode;
  }

  get treeLoadingMessage(): string {
    if (!this.data) return '';
    return this.data.treeLoadingMessage;
  }

  get colorDefinitions(): any {
    return this.ds.colorDefinitions;
  }

  public get treeData(): Array<TreeViewNode> {
    return this.ds.assetSelectorTreeData;
  }

  public set treeData(value: Array<TreeViewNode>) {
    this.ds.assetSelectorTreeData = value;
  }
}
