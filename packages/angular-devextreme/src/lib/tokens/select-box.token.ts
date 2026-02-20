import { InjectionToken } from '@angular/core';
import { SelectBoxDataProvider } from '../interfaces/select-box.interface';

/**
 * Injection Token สำหรับ SelectBoxDataProvider
 * Consumer App จะต้อง provide token นี้ผ่าน CnxSelectBoxModule.forRoot()
 *
 * @example
 * // ใน AppModule
 * CnxSelectBoxModule.forRoot(AppSelectBoxService)
 */
export const SELECTBOX_DATA_PROVIDER = new InjectionToken<SelectBoxDataProvider>(
  'SELECTBOX_DATA_PROVIDER'
);
