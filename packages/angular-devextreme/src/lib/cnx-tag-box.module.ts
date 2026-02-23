import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { DxTagBoxModule, DxTemplateModule } from 'devextreme-angular';
import { CnxTagBoxComponent } from './components/cnx-tag-box/cnx-tag-box.component';
import { TagBoxDataProvider } from './interfaces/cnx-tag-box.interface';
import { TAGBOX_DATA_PROVIDER } from './tokens/cnx-tag-box.token';

@NgModule({
  declarations: [CnxTagBoxComponent],
  imports: [CommonModule, DxTagBoxModule, DxTemplateModule],
  exports: [CnxTagBoxComponent, DxTagBoxModule, DxTemplateModule],
})
export class CnxTagBoxModule {
  static forRoot(
    providerClass: Type<TagBoxDataProvider>
  ): ModuleWithProviders<CnxTagBoxModule> {
    return {
      ngModule: CnxTagBoxModule,
      providers: [
        {
          provide: TAGBOX_DATA_PROVIDER,
          useClass: providerClass,
        },
      ],
    };
  }
}
