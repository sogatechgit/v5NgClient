import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector, inject } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// test/sandbox components
import { FontAwesomeComponent } from './sandbox/font-awesome/font-awesome.component';
import { MaterialsComponent } from './sandbox/materials/materials.component';

// contains all module imports related to Angular Materials/CDK
import { HttpClientModule } from '@angular/common/http';

// contains all module imports related to Angular Materials/CDK
import { CoreModule } from './cmp/core.module';

// Application sandbox components

import { TestDataGridComponent } from './cmp/test-data-grid/test-data-grid.component';
import { TestPanelComponent } from './sandbox/test-panel/test-panel.component';
import { TestSubListComponent } from './sandbox/test-sub-list/test-sub-list.component';
import { TestDetailsComponent } from './sandbox/test-details/test-details.component';
import { TestDirectiveComponent } from './sandbox/test-directive/test-directive.component';
import { TestDirective } from './sandbox/test-directive/testdir.directive';
import { TestDynamicComponentComponent } from './sandbox/test-dynamic-component/test-dynamic-component.component';

// custom components
import { AppCommonMethodsService } from './api/svc/app-common-methods.service';
import { DetailsPopup } from './api/cmp/details.popup';
import { DetailsDirective } from './api/cmp/details.directive';


// new in v2
import { MainFramesetComponent } from './cmp/main-frameset/main-frameset.component';
// import { FileUploaderComponent } from './api/cmp/file-uploader/file-uploader.component';


// will become obsolete with v2
import { MainFrameBComponent } from './sandbox/main-frame-b/main-frame-b.component';


export function initializeApp1(appInitService: AppCommonMethodsService) {
  return (): Promise<any> => {
    return appInitService.Init();
  };
}

@NgModule({
  declarations: [
    AppComponent,

    TestDataGridComponent,
    TestPanelComponent,
    TestSubListComponent,
    TestDetailsComponent,
    TestDirectiveComponent,
    TestDirective,

    FontAwesomeComponent,
    MaterialsComponent,

    DetailsPopup,
    DetailsDirective,
    TestDynamicComponentComponent,

    // new in v2 implementation
    MainFramesetComponent,
    // FileUploaderComponent,

    // will become obsolete with v2 implementation

    MainFrameBComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,

    CoreModule,
  ],
  providers: [
    AppCommonMethodsService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp1,
      deps: [AppCommonMethodsService],
      multi: true,
    },
    Title,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  static injector: Injector;
  constructor(injector:Injector){
    AppModule.injector = injector;
  }
}
