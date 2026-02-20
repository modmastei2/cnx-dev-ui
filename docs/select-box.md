# SelectBox Component (`<cnx-select-box>`)

Component สำหรับแสดงผล Dropdown ที่ถูกครอบทับ `DxSelectBox` ของ DevExtreme โดยออกแบบมาเพื่อดึงข้อมูลแบบ Dynamic ผ่าน Dependency Injection (DI) ทำให้โค้ดของหน้า UI สะอาด และสามารถนำไปใช้ซ้ำได้ง่าย

## ✨ คุณสมบัติเด่น (Features)

- **Dependency Inversion**: ไม่ผูกติดกับ API ตรงๆ แต่ทำงานผ่าน `SELECTBOX_DATA_PROVIDER`
- **Dynamic Data Source**: จัดการ Pagination และ Search API ให้ภายในตัว
- **Cascade By**: รองรับการกรองข้อมูลแบบมีเงื่อนไข (เช่น เลือกบัญชีธนาคาร ตามธนาคารที่เลือกไว้)
- **Ignore Value**: สามารถกำหนด Array ของ `value` ที่ไม่ต้องแสดงใน Dropdown ได้
- **Custom Data Source**: สามารถโยน Array หรือ DataSource เข้ามาตรงๆ โดยไม่ต้องพึ่ง API Service
- **IntelliSense Ready**: รองรับ TypeScript Declaration Merging ให้แจ้งเตือน Key ของโปรเจกต์อัตโนมัติ

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Module และ Provider

ใน `app.module.ts` ของโปรเจกต์ (หรือไฟล์ที่กำหนด Providers สำหรับ Standalone app) คุณต้องนำเข้า `CnxSelectBoxModule` และ Provide Service สำหรับดึงข้อมูล

```typescript
import { NgModule } from '@angular/core';
import { DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';
import { CnxSelectBoxModule } from '@cnx-dev/angular-devextreme';
import { AppSelectBoxService } from './services/app-select-box.service';

@NgModule({
  imports: [
    // 1. ต้อง import DevExtreme module ด้วย
    DxSelectBoxModule,
    DxTemplateModule,

    // 2. นำเข้า CnxSelectBoxModule พร้อมกำหนด Service ด้วย forRoot()
    CnxSelectBoxModule.forRoot(AppSelectBoxService),
  ],
})
export class AppModule {}
```

### 2. การสร้าง Data Provider Service

ต้องสร้าง Angular Service ที่ Implement `SelectBoxDataProvider` เพื่อจัดการลอจิกการดึงข้อมูลตาม API ของโปรเจกต์เอง

**แบบที่ 1: Basic (ใช้ If-Else)**

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectBoxDataProvider, SelectBoxKey, SelectBoxParam, SelectBoxLoadResult } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppSelectBoxService implements SelectBoxDataProvider {
  getService(key: SelectBoxKey, param: SelectBoxParam): Observable<SelectBoxLoadResult> {
    if (key === 'bank') {
      const data = [{ text: 'ธนาคารกรุงเทพ', value: 'BBL', dropdownText: 'BBL - ธนาคารกรุงเทพ' }];
      return of({ data: data, totalCount: data.length, hasInitialValue: false });
    }
    return of(new SelectBoxLoadResult());
  }
}
```

**แบบที่ 2: Advanced (Dynamic Method Routing)**
รูปแบบนี้ทำให้โค้ดเป็นระเบียบเมื่อมี Dropdown จำนวนมาก โดยหลีกเลี่ยง Switch/If-Else ที่ยาวเกินไป

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SelectBoxDataProvider, SelectBoxKey, SelectBoxParam, SelectBoxLoadResult } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppSelectBoxService implements SelectBoxDataProvider {
  // Method หลัก แค่เช็คว่ามีค่าส่งมาหรือไม่ แล้วส่งต่อให้ Method ตามชื่อ Key
  public getService(selectBoxKey: SelectBoxKey, param: SelectBoxParam): Observable<SelectBoxLoadResult> {
    if (!selectBoxKey) return of(new SelectBoxLoadResult());

    // เรียกใช้งาน Method แบบ Dynamic ด้วยวงเล็บเหลี่ยม (this['bank'])
    const method = (this as any)[selectBoxKey as string];
    if (typeof method === 'function') {
      return method.call(this, param);
    }

    console.warn(`ไม่มี Endpoint สำหรับดึงข้อมูล SelectBoxKey: ${selectBoxKey}`);
    return of(new SelectBoxLoadResult());
  }

  // แยก Method รอรับตาม selectBoxKey ได้เลย
  private bank(param: SelectBoxParam): Observable<SelectBoxLoadResult> {
    const data = [{ text: 'ธนาคารกรุงเทพ', value: 'BBL', dropdownText: 'BBL - ธนาคารกรุงเทพ' }];
    return of({ data: data, totalCount: data.length });
  }

  private department(param: SelectBoxParam): Observable<SelectBoxLoadResult> {
    // โค้ดดึงข้อมูลแผนก
    return of({ data: [], totalCount: 0 });
  }
}
```

### 3. การแสดงผลใน HTML

```html
<!-- แบบพื้นฐาน (ผู้ใช้ต้องกำหนด Type สำหรับ Auto-complete เอง) -->
<cnx-select-box [selectBoxKey]="'bank'" [placeholder]="'เลือกธนาคาร...'" (onValueChanged)="onBankChanged($event)"> </cnx-select-box>

<!-- แบบ Cascade (บัญชีที่ผูกกับธนาคาร) -->
<cnx-select-box [selectBoxKey]="'bankAccount'" [cascadeBy]="selectedBankValue" [disabled]="!selectedBankValue"> </cnx-select-box>

<!-- แบบ Custom DataSource (ไม่ต้องพึ่ง API หรือ Service ภายใน) -->
<cnx-select-box [customDataSource]="myCustomArray" [placeholder]="'เลือกข้อมูลกำหนดเอง...'"> </cnx-select-box>
```

### 4. การตั้งค่า Auto-Complete ให้กับ SelectBoxKey (TypeScript)

โดยค่าเริ่มต้น `selectBoxKey` จะสามารถรับค่า `string` อะไรก็ได้ แต่คุณสามารถให้ IDE ช่วยทำ Auto-Complete แจ้งเตือน Key เฉพาะของแอปตัวเองได้ โดยใช้ **Declaration Merging**:

สร้างไฟล์ `select-box-keys.d.ts` (หรือประกาศไว้ในส่วนใดก็ได้ของโปรเจกต์):

```typescript
declare module '@cnx-dev/angular-devextreme' {
  // ใส่ชื่อ Key ที่มีในระบบคุณทั้งหมดตรงนี้
  export interface ModuleSelectBoxKeys {
    bank: any;
    department: any;
    currency: any;
    // ...
  }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Inputs (`@Input`)

| Property           | Type               | Default     | Description                                                                     |
| :----------------- | :----------------- | :---------- | :------------------------------------------------------------------------------ |
| `selectBoxKey`     | `SelectBoxKey`     | `undefined` | **(บังคับ)** Key ที่ใช้ระบุประเภทข้อมูลสำหรับส่งให้ Data Provider เช่น `'bank'` |
| `customDataSource` | `any`              | `undefined` | โยน Array หรือ DataSource ให้ทำงานตรงๆ (ถ้าใส่ค่านี้ จะข้ามการทำงานของ Service) |
| `value`            | `any`              | `null`      | ค่าที่ถูกเลือกตั้งต้น (NgModel ภายนอก)                                          |
| `placeholder`      | `string`           | `''`        | ข้อความแสดงเมื่อยังไม่มีการเลือก                                                |
| `disabled`         | `boolean`          | `false`     | ปิดการใช้งานฟิลด์                                                               |
| `cascadeBy`        | `any`              | `undefined` | ค่า Parent ที่ใช้กรองข้อมูลลูก (เช่น ส่ง id ธนาคารไปให้ Data Provider)          |
| `ignoreValue`      | `string[]`         | `[]`        | รายการของ `value` ที่ต้องการซ่อนไม่ให้แสดงในตัวเลือกชั่วคราว                    |
| `width`            | `string \| number` | `undefined` | ความกว้างของกล่อง Input                                                         |
| `dropdownWidth`    | `string \| number` | `undefined` | ความกว้างของ Dropdown ตอนกดกางออก                                               |
| `showClearButton`  | `boolean`          | `true`      | แสดงปุ่มลบ (กากบาท) ท้ายกล่องหรือไม่                                            |

### Outputs (`@Output`)

| Event            | Event Object                             | Description                                          |
| :--------------- | :--------------------------------------- | :--------------------------------------------------- |
| `onValueChanged` | `{ value: any, component: DxSelectBox }` | ทำงานเมื่อผู้ใช้เปลี่ยนค่าที่เลือก (Dropdown)        |
| `onEnterKey`     | `void`                                   | ทำงานเมื่อผู้ใช้กดปุ่ม Enter ขณะที่โฟกัสอยู่ใน Input |
