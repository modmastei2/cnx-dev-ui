# TagBox Component (`<cnx-tag-box>`)

Component สำหรับแสดงผลการเลือกข้อมูลได้หลายค่า (Multiple selection) โดยครอบทับ `DxTagBox` ของ DevExtreme ออกแบบมาให้รองรับ Dependency Injection (DI) และสามารถโหลดข้อมูลได้แบบเดียวกันกับ SelectBox

## ✨ คุณสมบัติเด่น (Features)

- **Dependency Inversion**: ทำงานผ่าน `TAGBOX_DATA_PROVIDER` ช่วยลดความซ้ำซ้อนของโค้ดดึงข้อมูล
- **Multiple Selection**: รองรับการเลือกหลายรายการพร้อมกัน
- **Custom Data Source**: สามารถส่งข้อมูลแบบ Array เข้าไปได้ตรงๆ
- **Cascade By**: รองรับการกรองโชว์ข้อมูลล้อตามค่า Parent
- **Tag Limiting**: สามารถกำหนดจำนวนสูงสุดของ Tag ที่จะแสดงผลได้ผ่าน `maxDisplayedTags`

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Module และ Provider

ใน `app.module.ts` ของโปรเจกต์ นำเข้า `CnxTagBoxModule` และ Provide Service เช่นเดียวกับ SelectBox

```typescript
import { NgModule } from '@angular/core';
import { CnxTagBoxModule } from '@cnx-dev/angular-devextreme';
import { AppTagBoxService } from './services/app-tag-box.service';

@NgModule({
    imports: [CnxTagBoxModule.forRoot(AppTagBoxService)],
})
export class AppModule {}
```

### 2. การสร้าง Data Provider Service

ต้องสร้าง Angular Service ที่ Implement `TagBoxDataProvider`

**แบบที่ 1: Basic (ใช้ If-Else)**

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TagBoxDataProvider, TagBoxKey, TagBoxParam, TagBoxLoadResult } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppTagBoxService implements TagBoxDataProvider {
    getService(key: TagBoxKey, param: TagBoxParam): Observable<TagBoxLoadResult> {
        if (key === 'roles') {
            const data = [
                { text: 'Admin', value: '1', dropdownText: '1 - Admin' },
                { text: 'User', value: '2', dropdownText: '2 - User' },
            ];
            return of({ data: data, totalCount: data.length, hasInitialValue: false });
        }
        return of(new TagBoxLoadResult());
    }
}
```

**แบบที่ 2: Advanced (Dynamic Method Routing)**
รูปแบบนี้ทำให้โค้ดเป็นระเบียบเมื่อมีกลุ่มข้อมูลจำนวนมาก โดยหลีกเลี่ยง Switch/If-Else ที่ยาวเกินไป

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TagBoxDataProvider, TagBoxKey, TagBoxParam, TagBoxLoadResult } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppTagBoxService implements TagBoxDataProvider {
    // Method หลัก แค่เช็คว่ามีค่าส่งมาหรือไม่ แล้วส่งต่อให้ Method ตามชื่อ Key
    public getService(key: TagBoxKey, param: TagBoxParam): Observable<TagBoxLoadResult> {
        if (!key) return of(new TagBoxLoadResult());

        // เรียกใช้งาน Method แบบ Dynamic ด้วยวงเล็บเหลี่ยม (this['roles'])
        const method = (this as any)[key as string];
        if (typeof method === 'function') {
            return method.call(this, param);
        }

        console.warn(`ไม่มี Endpoint สำหรับดึงข้อมูล TagBoxKey: ${key}`);
        return of(new TagBoxLoadResult());
    }

    // แยก Method รอรับตาม TagBoxKey ได้เลย
    private roles(param: TagBoxParam): Observable<TagBoxLoadResult> {
        const data = [
            { text: 'Admin', value: '1', dropdownText: '1 - Admin' },
            { text: 'User', value: '2', dropdownText: '2 - User' },
        ];
        return of({ data: data, totalCount: data.length, hasInitialValue: false });
    }

    private projects(param: TagBoxParam): Observable<TagBoxLoadResult> {
        // ส่วนคอนฟิกการโหลดโปรเจกต์
        return of({ data: [], totalCount: 0, hasInitialValue: false });
    }
}
```

### 3. การแสดงผลใน HTML

```html
<!-- แบบดึงข้อมูลจาก Service ตามชื่อ Key -->
<cnx-tag-box [tagBoxKey]="'roles'" placeholder="Choose roles..."> </cnx-tag-box>

<!-- แบบกำหนดข้อมูลเอง (ไม่ต้องผ่าน Service) -->
<cnx-tag-box [customDataSource]="myRoles" displayExpr="text" valueExpr="id"> </cnx-tag-box>
```

### 4. การตั้งค่า Auto-Complete ให้กับ TagBoxKey (TypeScript)

โดยค่าเริ่มต้น `tagBoxKey` จะสามารถรับค่า `string` อะไรก็ได้ แต่คุณสามารถให้ IDE ช่วยทำ Auto-Complete แจ้งเตือน Key เฉพาะของแอปตัวเองได้ โดยใช้ **Declaration Merging**:

สร้างไฟล์ `tag-box-keys.d.ts` (หรือประกาศไว้ในส่วนใดก็ได้ของโปรเจกต์):

```typescript
declare module '@cnx-dev/angular-devextreme' {
    // ใส่ชื่อ Key ที่มีในระบบคุณทั้งหมดตรงนี้
    export interface ModuleTagBoxKeys {
        roles: any;
        projects: any;
        // ...
    }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Inputs (`@Input`)

| Property                | Type               | Default              | Description                                                    |
| :---------------------- | :----------------- | :------------------- | :------------------------------------------------------------- |
| `tagBoxKey`             | `TagBoxKey`        | `null`               | Key ระบุข้อมูลส่งเข้า Service Provider                         |
| `id`                    | `string`           | `''`                 | **(บังคับ)** ID สำหรับอ้างอิงจุดประสงค์เฉพาะ                   |
| `name`                  | `string`           | `''`                 | **(บังคับ)** Name สำหรับ form binding                          |
| `value`                 | `string[]`         | `[]`                 | ค่าที่เลือกอยู่ (Array of Strings)                             |
| `customDataSource`      | `any[]`            | `undefined`          | ข้อมูล Array กำหนดเอง (ข้าม Service)                           |
| `placeholder`           | `string`           | `'Please select...'` | ข้อความตอนยังไม่เลือก                                          |
| `disabled`              | `boolean`          | `false`              | ปิดการใช้งาน                                                   |
| `cascadeBy`             | `any`              | `undefined`          | สำหรับการกรองข้อมูลลูก                                         |
| `displayExpr`           | `string`           | `'text'`             | Field ที่จะนำมาแสดงผลเมื่อถูกเลือก (Tag)                       |
| `valueExpr`             | `string`           | `'value'`            | Field ที่เป็นรหัสยืนยันตัวตนของไอเท็ม                          |
| `searchExpr`            | `string`           | `'dropdownText'`     | Field ที่ใช้ค้นหาข้อความ                                       |
| `dropdownExpr`          | `string`           | `'dropdownText'`     | Field ที่นำมาแสดงใน List Dropdown                              |
| `searchEnabled`         | `boolean`          | `true`               | เปิดปิดการพิมพ์ค้นหา                                           |
| `searchTimeout`         | `number`           | `500`                | หน่วงเวลาค้นหา (Debounce) (มิลลิวินาที)                        |
| `showClearButton`       | `boolean`          | `true`               | แสดงปุ่มลบ (กากบาท) ท้ายกล่องหรือไม่                           |
| `showSelectionControls` | `boolean`          | `true`               | แสดงช่อง Checkbox ด้านหน้า List ภายใน Dropdown หรือไม่         |
| `maxDisplayedTags`      | `number`           | `null`               | จำนวนป้าย Tag สูงสุดบนหน้าจอที่แสดงได้ (ส่วนเกินจะกลายเป็น ..) |
| `width`                 | `string \| number` | `'100%'`             | ความกว้างของกล่อง Input                                        |
| `dropdownWidth`         | `string \| number` | `undefined`          | ความกว้างของ Dropdown ตอนกดกางออก                              |
| `maxLength`             | `number`           | `0`                  | จำกัดความยาวตัวอักษรพิมพ์ค้นหาสูงสุด                           |

### Outputs (`@Output`)

| Event            | Event Object        | Description                              |
| :--------------- | :------------------ | :--------------------------------------- |
| `onValueChanged` | `ValueChangedEvent` | ทำงานเมื่อผู้ใช้เพิ่มหรือลดจำนวนที่เลือก |
| `onEnterKey`     | `void`              | กดปุ่ม Enter ในขณะ Focus                 |
