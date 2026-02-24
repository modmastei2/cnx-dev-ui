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

### 3. การแสดงผลใน HTML

```html
<!-- แบบดึงข้อมูลจาก Service ตามชื่อ Key -->
<cnx-tag-box [tagBoxKey]="'roles'" placeholder="Choose roles..."> </cnx-tag-box>

<!-- แบบกำหนดข้อมูลเอง (ไม่ต้องผ่าน Service) -->
<cnx-tag-box [customDataSource]="myRoles" displayExpr="text" valueExpr="id"> </cnx-tag-box>
```

---

## ⚙️ Properties & Events (API Reference)

### Inputs (`@Input`)

| Property                | Type        | Default              | Description                                                    |
| :---------------------- | :---------- | :------------------- | :------------------------------------------------------------- |
| `tagBoxKey`             | `TagBoxKey` | `null`               | Key ระบุข้อมูลส่งเข้า Service Provider                         |
| `customDataSource`      | `any[]`     | `undefined`          | ข้อมูล Array กำหนดเอง (ข้าม Service)                           |
| `value`                 | `string[]`  | `[]`                 | ค่าที่เลือกอยู่ (Array of Strings)                             |
| `placeholder`           | `string`    | `'Please select...'` | ข้อความตอนยังไม่เลือก                                          |
| `disabled`              | `boolean`   | `false`              | ปิดการใช้งาน                                                   |
| `cascadeBy`             | `any`       | `undefined`          | สำหรับการกรองข้อมูลลูก                                         |
| `displayExpr`           | `string`    | `'text'`             | Field ที่จะนำมาแสดงผลเมื่อถูกเลือก (Tag)                       |
| `valueExpr`             | `string`    | `'value'`            | Field ที่เป็นรหัสยืนยันตัวตนของไอเท็ม                          |
| `searchExpr`            | `string`    | `'dropdownText'`     | Field ที่ใช้ค้นหาข้อความ                                       |
| `dropdownExpr`          | `string`    | `'dropdownText'`     | Field ที่นำมาแสดงใน List Dropdown                              |
| `maxDisplayedTags`      | `number`    | `null`               | จำนวนป้าย Tag สูงสุดบนหน้าจอที่แสดงได้ (ส่วนเกินจะกลายเป็น ..) |
| `showSelectionControls` | `boolean`   | `true`               | แสดงช่อง Checkbox ด้านหน้า List ภายใน Dropdown หรือไม่         |

### Outputs (`@Output`)

| Event            | Event Object        | Description                              |
| :--------------- | :------------------ | :--------------------------------------- |
| `onValueChanged` | `ValueChangedEvent` | ทำงานเมื่อผู้ใช้เพิ่มหรือลดจำนวนที่เลือก |
| `onEnterKey`     | `void`              | กดปุ่ม Enter ในขณะ Focus                 |
