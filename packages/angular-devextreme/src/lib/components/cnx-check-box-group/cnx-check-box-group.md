# CheckBoxGroup Component (`<cnx-check-box-group>`)

Component สำหรับแสดงผลกลุ่มของ CheckBox ที่ถูกออกแบบมาเพื่อครอบทับ `DxCheckBox` ของ DevExtreme โดยมีระบบจัดการ State ภายในตัว รองรับการผูกข้อมูลทั้งแบบ Array ใน Memory และดึงผ่าน API (Dependency Injection)

## ✨ คุณสมบัติเด่น (Features)

- **Dependency Inversion**: สามารถดึงข้อมูลผ่าน API ยืดหยุ่นผ่าน `CHECKBOX_DATA_PROVIDER`
- **Single / Multiple Select**: สามารถสลับโหมดให้เลือกได้หลายข้อ หรือบีบให้เลือกได้ข้อเดียว (พฤติกรรมคล้าย Radio)
- **Direction Layout**: จัดเรียงตัวเลือกเป็นแนวตั้ง (`col`) หรือแนวนอน (`row`) ได้ง่ายๆ
- **Cascade By**: รองรับการโหลดข้อมูลใหม่เมื่อเงื่อนไข (Cascade) เปลี่ยนแปลง
- **Custom Expressions**: สามารถกำหนด `displayExpr` และ `valueExpr` สำหรับโยน Object แปลกๆ เข้ามาแสดงได้อิสระ
- **Ignore Value**: กรองเอาตัวเลือกที่ไม่ต้องการแสดงออกไปได้ทันที

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Module และ Provider

ใน `app.module.ts` หรือที่ที่กำหนด Providers ให้นำเข้า `CnxCheckBoxGroupModule` และ Provide Service สำหรับดึงข้อมูล (ถ้าต้องการใช้โหมดดึงจาก API)

```typescript
import { NgModule } from '@angular/core';
import { CnxCheckBoxGroupModule } from '@cnx-dev/angular-devextreme';
import { AppCheckBoxService } from './services/app-check-box.service';

@NgModule({
    imports: [CnxCheckBoxGroupModule.forRoot(AppCheckBoxService)],
})
export class AppModule {}
```

### 2. การสร้าง Data Provider Service (กรณีใช้ API)

ต้องสร้าง Angular Service ที่ Implement `CheckBoxDataProvider` เพื่อจัดการลอจิกการดึงข้อมูล

**แบบที่ 1: Basic (ใช้ If-Else)**

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CheckBoxDataProvider, CheckBoxKey, CheckBoxParam, CheckBoxViewModel } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppCheckBoxService implements CheckBoxDataProvider {
    getService(key: CheckBoxKey, param: CheckBoxParam): Observable<CheckBoxViewModel[]> {
        if (key === 'BANK') {
            return of([
                { text: 'ธนาคารกรุงเทพ', value: 'BBL' },
                { text: 'ธนาคารกสิกรไทย', value: 'KBANK' },
            ]);
        }
        return of([]);
    }
}
```

**แบบที่ 2: Advanced (Dynamic Method Routing)**
รูปแบบนี้ทำให้โค้ดเป็นระเบียบเมื่อมีกลุ่มข้อมูลจำนวนมาก โดยหลีกเลี่ยง Switch/If-Else ที่ยาวเกินไป

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CheckBoxDataProvider, CheckBoxKey, CheckBoxParam, CheckBoxViewModel } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppCheckBoxService implements CheckBoxDataProvider {
    // Method หลัก แค่เช็คว่ามีค่าส่งมาหรือไม่ แล้วส่งต่อให้ Method ตามชื่อ Key
    public getService(key: CheckBoxKey, param: CheckBoxParam): Observable<CheckBoxViewModel[]> {
        if (!key) return of([]);

        // เรียกใช้งาน Method แบบ Dynamic ด้วยวงเล็บเหลี่ยม (this['BANK'])
        const method = (this as any)[key as string];
        if (typeof method === 'function') {
            return method.call(this, param);
        }

        console.warn(`ไม่มี Endpoint สำหรับดึงข้อมูล CheckBoxKey: ${key}`);
        return of([]);
    }

    // แยก Method รอรับตาม CheckBoxKey ได้เลย
    private BANK(param: CheckBoxParam): Observable<CheckBoxViewModel[]> {
        return of([
            { text: 'ธนาคารกรุงเทพ', value: 'BBL' },
            { text: 'ธนาคารกสิกรไทย', value: 'KBANK' },
        ]);
    }

    private PROVINCE(param: CheckBoxParam): Observable<CheckBoxViewModel[]> {
        return of([
            { text: 'กรุงเทพมหานคร', value: 'BKK' },
            { text: 'เชียงใหม่', value: 'CNX' },
        ]);
    }
}
```

### 3. การแสดงผลใน HTML

```html
<!-- แบบพื้นฐาน (โยน Array ผ่าน customDataSource) -->
<cnx-check-box-group [id]="'basic1'" [name]="'basic1'" [customDataSource]="myItems" [value]="selectedValues" (onValueChanged)="onItemChanged($event)"> </cnx-check-box-group>

<!-- แบบโหมดเลือกข้อเดียว แนวนอน (Single + Row) -->
<cnx-check-box-group [id]="'single1'" [name]="'single1'" [customDataSource]="myItems" mode="single" direction="row"> </cnx-check-box-group>

<!-- แบบ Custom Object fields -->
<cnx-check-box-group [id]="'custom1'" [name]="'custom1'" [customDataSource]="customObjects" displayExpr="name" valueExpr="identifier"> </cnx-check-box-group>

<!-- แบบเรียกผ่าน API (ใช้ checkBoxKey) -->
<cnx-check-box-group [id]="'api1'" [name]="'api1'" [checkBoxKey]="'BANK'" [cascadeBy]="countryId"> </cnx-check-box-group>
```

### 4. การตั้งค่า Auto-Complete ให้กับ CheckBoxKey (TypeScript)

โดยค่าเริ่มต้น `checkBoxKey` จะสามารถรับค่า `string` อะไรก็ได้ แต่คุณสามารถให้ IDE ช่วยทำ Auto-Complete แจ้งเตือน Key เฉพาะของแอปตัวเองได้ โดยใช้ **Declaration Merging**:

สร้างไฟล์ `check-box-keys.d.ts` (หรือประกาศไว้ในส่วนใดก็ได้ของโปรเจกต์):

```typescript
declare module '@cnx-dev/angular-devextreme' {
    // ใส่ชื่อ Key ที่มีในระบบคุณทั้งหมดตรงนี้
    export interface ModuleCheckBoxKeys {
        BANK: any;
        PROVINCE: any;
        // ...
    }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Inputs (`@Input`)

| Property           | Type                     | Default      | Description                                                                  |
| :----------------- | :----------------------- | :----------- | :--------------------------------------------------------------------------- |
| `checkBoxKey`      | `CheckBoxKey`            | `null`       | Key ระบุชุดข้อมูลสำหรับดึงจาก `CheckBoxDataProvider`                         |
| `id`               | `string`                 | `''`         | **(บังคับ)** ID หลักสำหรับนำไปสร้าง ID ย่อยให้ CheckBox แต่ละตัว             |
| `name`             | `string`                 | `''`         | **(บังคับ)** Name หลักสำหรับสร้าง Name ย่อยให้ CheckBox แต่ละตัว             |
| `value`            | `string[]`               | `[]`         | อาร์เรย์ของ value ที่ถูกติ๊กเลือกอยู่                                        |
| `customDataSource` | `any[]`                  | `undefined`  | รับอาร์เรย์ข้อมูลโดยตรง (ระบบจะลอก Object ให้อัตโนมัติป้องกัน state ทับซ้อน) |
| `disabled`         | `boolean`                | `false`      | ปิดการใช้งาน CheckBox ทั้งกลุ่ม                                              |
| `direction`        | `'col' \| 'row'`         | `'col'`      | ทิศทางการเรียงตัวก้อนข้อมูล (แนวตั้ง/แนวนอน)                                 |
| `mode`             | `'multiple' \| 'single'` | `'multiple'` | โหมดการติ๊ก `multiple` ติ๊กได้หลายข้อ / `single` ติ๊กได้ข้อเดียว             |
| `cascadeBy`        | `any`                    | `undefined`  | ค่า Dependency หากเปลี่ยน ตัว CheckBox จะโหลดข้อมูลจาก API ใหม่              |
| `ignoreValue`      | `string[]`               | `[]`         | รายการ `value` ที่ไม่ต้องแสดงบนหน้าจอ                                        |
| `displayExpr`      | `string`                 | `'text'`     | ชื่อฟิลด์ใน Object ที่ใช้ประเมินเป็นคำอธิบาย (Label)                         |
| `valueExpr`        | `string`                 | `'value'`    | ชื่อฟิลด์ใน Object ที่ใช้ประเมินค่าเก็บข้อมูล (Value)                        |

### Outputs (`@Output`)

| Event            | Event Object          | Description                                    |
| :--------------- | :-------------------- | :--------------------------------------------- |
| `onValueChanged` | `{ value: string[] }` | ทำงานเมื่อผู้ใช้กดติ๊ก/เอาออก CheckBox ในกลุ่ม |
