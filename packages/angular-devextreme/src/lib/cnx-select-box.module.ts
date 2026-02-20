import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';
import { SelectBoxComponent } from './components/select-box/select-box.component';
import { SelectBoxDataProvider } from './interfaces/select-box.interface';
import { SELECTBOX_DATA_PROVIDER } from './tokens/select-box.token';

/**
 * Module สำหรับ SelectBox Component
 *
 * Consumer App ต้อง import module นี้เพื่อใช้งาน:
 * @example
 * imports: [
 *   CnxSelectBoxModule.forRoot(AppSelectBoxService),
 * ]
 */
@NgModule({
  declarations: [SelectBoxComponent],
  imports: [CommonModule, DxSelectBoxModule, DxTemplateModule],
  exports: [SelectBoxComponent, DxSelectBoxModule, DxTemplateModule],
})
export class CnxSelectBoxModule {
  static forRoot(
    providerClass: Type<SelectBoxDataProvider>
  ): ModuleWithProviders<CnxSelectBoxModule> {
    return {
      ngModule: CnxSelectBoxModule,
      providers: [
        {
          provide: SELECTBOX_DATA_PROVIDER,
          useClass: providerClass,
        },
      ],
    };
  }
}
