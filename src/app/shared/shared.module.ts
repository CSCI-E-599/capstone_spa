import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { ShortestValueFromArrayPipe } from './pipes/shortest-value-from-array.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { GetDiffAdditionsCountPipe } from './pipes/get-diff-additions-count.pipe';
import { GetDiffDeletionsCountPipe } from './pipes/get-diff-deletions-count.pipe';

/**
 * SharedModule
 * An Angular module use to manage all of the shared components and services that are meant to be available across the
 * web application. Other modules using any of the shared components or services only need to import the shared module
 * in order to make the accessible.
 */

@NgModule({
  declarations: [
    NavbarComponent,
    ShortestValueFromArrayPipe,
    TruncatePipe,
    SanitizeHtmlPipe,
    GetDiffAdditionsCountPipe,
    GetDiffDeletionsCountPipe
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavbarComponent,
    ShortestValueFromArrayPipe,
    TruncatePipe,
    SanitizeHtmlPipe,
    GetDiffAdditionsCountPipe,
    GetDiffDeletionsCountPipe
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class SharedModule {

}
