
import { Directive, ViewContainerRef } from '@angular/core';
@Directive({
  selector: '[detailsHost]',
})
export class DetailsDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
