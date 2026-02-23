import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { DxRadioGroupModule, DxTemplateModule } from 'devextreme-angular';
import { CnxRadioGroupComponent } from './components/cnx-radio-group/cnx-radio-group.component';
import { RadioGroupDataProvider } from './interfaces/cnx-radio-group.interface';
import { RADIO_GROUP_DATA_PROVIDER } from './tokens/cnx-radio-group.token';

/**
 * Module สำหรับ RadioGroup Component
 *
 * ถ้าต้องการโหลดข้อมูลจาก service ให้ใช้ forRoot:
 * @example
 * imports: [
 *   CnxRadioGroupModule.forRoot(AppRadioGroupService),
 * ]
 *
 * ถ้าใช้ dataSource แบบ in-memory ก็ import เลย:
 * @example
 * imports: [CnxRadioGroupModule]
 */
@NgModule({
  declarations: [CnxRadioGroupComponent],
  imports: [CommonModule, DxRadioGroupModule, DxTemplateModule],
  exports: [CnxRadioGroupComponent, DxRadioGroupModule, DxTemplateModule],
})
export class CnxRadioGroupModule {
  static forRoot(
    providerClass: Type<RadioGroupDataProvider>
  ): ModuleWithProviders<CnxRadioGroupModule> {
    return {
      ngModule: CnxRadioGroupModule,
      providers: [
        {
          provide: RADIO_GROUP_DATA_PROVIDER,
          useClass: providerClass,
        },
      ],
    };
  }
}
