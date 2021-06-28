import {
  Output,
  ViewChild,
  Component,
  AfterViewInit,
  Inject,
  Type,
  OnInit,
  ComponentFactoryResolver,
  EventEmitter,
  ɵɵtrustConstantResourceUrl,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { DetailsDirective } from './details.directive';

@Component({
  templateUrl: './details.popup.html',
  // template: `
  //   <h1 *ngIf="error">Error: {{ error }}</h1>

  //   <h3
  //     mat-dialog-title
  //     cdkDrag
  //     cdkDragRootElement=".cdk-overlay-pane"
  //     cdkDragHandle
  //     class="noselect p-0 m-0"
  //   >
  //     <i *ngIf="data.icon" [class]="'ml-2 ' + [icon]"></i
  //     ><span class="ml-2">{{ data.title ? data.title : 'No Title' }}</span>
  //   </h3>

  //   <mat-dialog-content class="mat-typography">
  //     <ng-template detailsHost></ng-template>
  //   </mat-dialog-content>

  //   <mat-dialog-actions
  //     *ngIf="data.buttons"
  //     align="center"
  //     class="p-0"
  //     style="height:35px;"
  //   >
  //     <button
  //       *ngFor="let btn of this.data.buttons"
  //       [class]="(btn.style ? btn.style : 'btn btn-primary') + ' m-0 ml-2'"
  //       (click)="ButtonClick(btn)" [disabled]="processing"
  //     ><i *ngIf="btn.icon && !btn.btnIconRight" [class]="btn.icon ? ' ' + btn.icon : ''"></i>
  //       {{ btn.label }}<i *ngIf="btn.icon && btn.btnIconRight" [class]="btn.icon ? ' ' + btn.icon : ''"></i>
  //     </button>
  //   </mat-dialog-actions>
  //   <!-- <div *ngIf="showMask" style="position:absolute;top:-24px;left:-24px;width:calc(100% + 48px);height:calc(100% + 48px);z-index:10;background:black;opacity:0.2;">&nbsp;</div> -->
  // `,
  styleUrls: ['./details.popup.scss'],
})
export class DetailsPopup implements OnInit, AfterViewInit {
  // @ViewChild(DetailsDirective, { static: true })
  // detailsDirective: DetailsDirective;

  @ViewChild(DetailsDirective, { static: true }) host: DetailsDirective;
  @Output() buttonClick: EventEmitter<any> = new EventEmitter();

  public error: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DetailsPopup>,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    // console.log('popup DATA: ', this.data);
  }

  ngAfterViewInit() {
    // console.log('\nngAfterViewInit detailsDirective:', this.host);
    // console.log('this.detailsItem: ', this.detailsItem.data.componentInstance);
  }

  get withForm(): boolean {
    if (!this.detailsItem) return false;
    if (!this.detailsItem.data) return false;
    if (!this.detailsItem.data.componentInstance) return false;
    if (!this.detailsItem.data.componentInstance.form) return false;
    return true;
  }

  get locked(): boolean {
    return this.withForm
      ? this.detailsItem.data.componentInstance.form.locked
      : false;
  }

  get lockedBy(): string {
    return this.withForm
      ? this.detailsItem.data.componentInstance.form.lockedBy
      : "";
  }

  get lockedDateTime():string{
    return this.withForm
      ? this.detailsItem.data.componentInstance.form.lockedDateTime
      : "";
  }

  get lockInfo():string{
    return `${this.lockedBy}, ${this.lockedDateTime}`;
  }

  get isLoading(): boolean {
    return this.withForm
      ? this.detailsItem.data.componentInstance.form.isLoadingDetail
      : false;
  }

  ngOnInit() {
    this.LoadComponent();
    // console.log('This.data!', this.data);
  }

  public get previewMode(): boolean {
    return true;
    //isOpenPreview
  }

  public get icon(): string {
    const ico = this.data.icon;

    if (
      ico.indexOf('far ') == 0 ||
      ico.indexOf('fab ') == 0 ||
      ico.indexOf('fas ') == 0
    ) {
      return ico;
    } else {
      return 'fa ' + ico;
    }
  }

  get detailsItem(): DetailsItem {
    if (!this.data) return null;
    return this.data.component;
  }

  get processing(): boolean {
    if (this.detailsItem.data.processing == undefined)
      this.detailsItem.data.processing = false;
    return this.detailsItem.data.processing;
  }

  private _componentRef: any;
  get ChildComponent(): any {
    if (!this._componentRef) return null;
    return this._componentRef.instance;
  }

  LoadComponent() {
    if (!this.detailsItem) {
      this.error = 'Details item not defined.';
      return;
    }
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      this.detailsItem.component
    );

    if (!this.host) {
      this.error = 'Component sost directive not found';
      return;
    }

    const viewContainerRef = this.host.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent<DetailsComponent>(
      componentFactory
    );
    // set instatiated component data property to the DetailsItem data property
    componentRef.instance.data = this.detailsItem.data;

    this._componentRef = componentRef;
  }

  get DetailsTitle(): string {
    if (!this.detailsItem.data) return null;
    if (!this.detailsItem.data.title) return null;
    return this.detailsItem.data.title;
  }

  ButtonClick(btn: IPopupButton) {
    //console.log("\n",btn.label)
    if (this.data) {
      if (this.data.buttonClick)
        this.data.buttonClick({ button: btn, sender: this });
    } else {
      this.buttonClick.emit({ button: btn, sender: this });
    }
  }
}

export class PopupButton {
  constructor(
    public label: string,
    public id?: string,
    public icon?: string,
    public action?: Function,
    public style?: string,
    public value?: string
  ) {}
  //,public icon?:string,public action?:Function,public class?:string,public value?:string
}

export interface IPopupButton {
  id?: string;
  label: string;
  icon?: string;
  btnIconRight?: boolean;
  action?: Function;
  style?: string;
  value?: string;
}
export interface IPopupPrompt {
  message?: string;
  title?: string;
  icon?: string;
  icon_color?: string;
  buttons?: Array<IPopupButton>;
}
export interface IPopupPrompts {
  cancelNoChange?: IPopupPrompt;
  cancelWithChange?: IPopupPrompt;

  resetNoChange?: IPopupPrompt;
  resetWithChange?: IPopupPrompt;

  saveNoChange?: IPopupPrompt;
  saveWithChange?: IPopupPrompt;

  linkNoSelected?: IPopupPrompt;
  linkWithSelected?: IPopupPrompt;

  deleteWithRecord?: IPopupPrompt;
  deleteNoRecord?: IPopupPrompt;
}

/**
 *   clickAction(mode: string) {
    switch (mode) {
      case 'reset':
        if(this.subComponent.Reset)this.subComponent.Reset(this.dialogRef);
        break;
      case 'save':
        if(this.subComponent.Save)this.subComponent.Save(this.dialogRef);
        break;
      break;
        case 'close':
      case 'cancel':
        this.dialogRef.close(null);
        break;
      case 'accept':
        this.acceptAndClose();
        break;
      default:
        this.dialogRef.close({mode:mode});
    }
  }
 *
 */

export class DetailsItem {
  constructor(public component: Type<any>, public data: any) {}
}

export interface DetailsComponent {
  data: any;
}
