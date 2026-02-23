import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { DxCheckBoxModule, DxTemplateModule } from 'devextreme-angular';
import { CnxCheckBoxGroupComponent } from './components/cnx-check-box-group/cnx-check-box-group.component';
import { CheckBoxDataProvider } from './interfaces/cnx-check-box-group.interface';
import { CHECKBOX_DATA_PROVIDER } from './tokens/cnx-check-box-group.token';

/**
 * Module สำหรับ CheckBoxGroup Component
 *
 * ถ้าต้องการโหลดข้อมูลจาก service ให้ใช้ forRoot:
 * @example
 * imports: [
 *   CnxCheckBoxGroupModule.forRoot(AppCheckBoxService),
 * ]
 *
 * ถ้าใช้ dataSource แบบ in-memory ก็ import เลย:
 * @example
 * imports: [CnxCheckBoxGroupModule]
 */
@NgModule({
  declarations: [CnxCheckBoxGroupComponent],
  imports: [CommonModule, DxCheckBoxModule, DxTemplateModule],
  exports: [CnxCheckBoxGroupComponent, DxCheckBoxModule, DxTemplateModule],
})
export class CnxCheckBoxGroupModule {
  static forRoot(
    providerClass: Type<CheckBoxDataProvider>
  ): ModuleWithProviders<CnxCheckBoxGroupModule> {
    return {
      ngModule: CnxCheckBoxGroupModule,
      providers: [
        {
          provide: CHECKBOX_DATA_PROVIDER,
          useClass: providerClass,
        },
      ],
    };
  }
}
