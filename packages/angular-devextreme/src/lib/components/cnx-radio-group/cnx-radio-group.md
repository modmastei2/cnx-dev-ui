# RadioGroup Component (`<cnx-radio-group>`)

Component สำหรับแสดงผลตัวเลือกปุ่มวิทยุ (Radio) แบบเลือกได้ข้อเดียว ครอบทับ `DxRadioGroup` ของ DevExtreme ออกแบบมาให้รองรับการดึงข้อมูลจาก API แบบพลวัต (Dynamic) ผ่าน Dependency Injection และจัดการค่า Auto-default ได้ในตัว

## ✨ คุณสมบัติเด่น (Features)

- **Dependency Inversion**: ดึงข้อมูลแยกตามประเภทจากศูนย์กลางผ่าน `RADIO_GROUP_DATA_PROVIDER`
- **Auto Default**: สามารถสั่งให้เลือกค่าแรกในลิสต์อัตโนมัติ (เป็น Default ล่วงหน้า) หากไม่ได้ล็อกค่าตั้งต้นไว้
- **Flexible Layout**: มีให้เลือกจัดเรียงแนวนอน (`horizontal`) หรือแนวตั้ง (`vertical`)
- **Custom Expressions**: สามารถชี้ตัวแปร `displayExpr` และ `valueExpr` เพื่อนำ Object ชนิดใดก็ได้มาทำ Radio
- **Cascade Trigger**: อัปเดตข้อมูลลอจิกอัตโนมัติทันทีที่ค่าอ้างอิงของแม่ (Cascade) เปลี่ยนแปลง

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Module และ Provider

ในไฟล์ที่จัดการ Provider ของคุณ ให้นำเข้า `CnxRadioGroupModule` เพื่อพร้อมใช้งาน

```typescript
import { NgModule } from '@angular/core';
import { CnxRadioGroupModule } from '@cnx-dev/angular-devextreme';
import { AppRadioGroupService } from './services/app-radio-group.service';

@NgModule({
    imports: [CnxRadioGroupModule.forRoot(AppRadioGroupService)],
})
export class AppModule {}
```

### 2. การสร้าง Data Provider Service (กรณีใช้ API)

สร้าง Service สืบทอดค่าจาก `RadioGroupDataProvider` โดยสามารถส่งค่า Object ธรรมดากลับไปเพื่อให้ Component แปลงเป็นรูปแบบ Radio ได้เอง

**แบบที่ 1: Basic (ใช้ If-Else)**

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RadioGroupDataProvider, RadioGroupKey, RadioGroupParam, RadioGroupViewModel } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppRadioGroupService implements RadioGroupDataProvider {
    getService(key: RadioGroupKey, param: RadioGroupParam): Observable<RadioGroupViewModel[]> {
        if (key === 'STATUS') {
            return of([
                { text: 'ใช้งาน', value: 'ACTIVE' },
                { text: 'ระงับการใช้งาน', value: 'INACTIVE' },
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
import { RadioGroupDataProvider, RadioGroupKey, RadioGroupParam, RadioGroupViewModel } from '@cnx-dev/angular-devextreme';

@Injectable()
export class AppRadioGroupService implements RadioGroupDataProvider {
    // Method หลัก แค่เช็คว่ามีค่าส่งมาหรือไม่ แล้วส่งต่อให้ Method ตามชื่อ Key
    public getService(key: RadioGroupKey, param: RadioGroupParam): Observable<RadioGroupViewModel[]> {
        if (!key) return of([]);

        // เรียกใช้งาน Method แบบ Dynamic ด้วยวงเล็บเหลี่ยม (this['STATUS'])
        const method = (this as any)[key as string];
        if (typeof method === 'function') {
            return method.call(this, param);
        }

        console.warn(`ไม่มี Endpoint สำหรับดึงข้อมูล RadioGroupKey: ${key}`);
        return of([]);
    }

    // แยก Method รอรับตาม RadioGroupKey ได้เลย
    private STATUS(param: RadioGroupParam): Observable<RadioGroupViewModel[]> {
        return of([
            { text: 'ใช้งาน', value: 'ACTIVE' },
            { text: 'ระงับการใช้งาน', value: 'INACTIVE' },
        ]);
    }

    private GENDER(param: RadioGroupParam): Observable<RadioGroupViewModel[]> {
        return of([
            { text: 'ชาย', value: 'M' },
            { text: 'หญิง', value: 'F' },
            { text: 'ไม่ระบุ', value: 'X' },
        ]);
    }
}
```

### 3. การแสดงผลใน HTML

```html
<!-- แบบพื้นฐาน (โยน Array ผ่าน customDataSource + Horizontal ธรรมดา) -->
<cnx-radio-group [id]="'status1'" [name]="'status1'" [customDataSource]="statusItems" [value]="currentStatus" (onValueChanged)="onStatusChange($event)"> </cnx-radio-group>

<!-- แบบไม่เอาค่า Auto Default ข้อแรก (บังคับว่างจนกว่าจะกด) -->
<cnx-radio-group [id]="'status2'" [name]="'status2'" [customDataSource]="statusItems" [autoDefault]="false"> </cnx-radio-group>

<!-- แบบเรียก API ผ่าน radioGroupKey (เรียงแนวตั้ง) -->
<cnx-radio-group [id]="'status3'" [name]="'status3'" [radioGroupKey]="'STATUS'" [layout]="'vertical'"> </cnx-radio-group>
```

### 4. การตั้งค่า Auto-Complete ให้กับ RadioGroupKey (TypeScript)

โดยค่าเริ่มต้น `radioGroupKey` จะสามารถรับค่า `string` อะไรก็ได้ แต่คุณสามารถให้ IDE ช่วยทำ Auto-Complete แจ้งเตือน Key เฉพาะของแอปตัวเองได้ โดยใช้ **Declaration Merging**:

สร้างไฟล์ `radio-group-keys.d.ts` (หรือประกาศไว้ในส่วนใดก็ได้ของโปรเจกต์):

```typescript
declare module '@cnx-dev/angular-devextreme' {
    // ใส่ชื่อ Key ที่มีในระบบคุณทั้งหมดตรงนี้
    export interface ModuleRadioGroupKeys {
        STATUS: any;
        GENDER: any;
        // ...
    }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Inputs (`@Input`)

| Property           | Type                         | Default        | Description                                                                                  |
| :----------------- | :--------------------------- | :------------- | :------------------------------------------------------------------------------------------- |
| `radioGroupKey`    | `RadioGroupKey`              | `null`         | Key สำหรับร้องขอชุดข้อมูลจาก `RadioGroupDataProvider`                                        |
| `id`               | `string`                     | `''`           | **(บังคับ)** ID หลักสำหรับนำไปสร้าง ID ให้ Group และ Radio ย่อย                              |
| `name`             | `string`                     | `''`           | **(บังคับ)** ชื่อก้อน Radio (ต้องเหมือนกันเพื่อให้เลือกได้ชอยส์เดียวในกลุ่ม)                 |
| `value`            | `string`                     | `''`           | ค่าที่มีการเลือกเอาไว้อยู่ปัจจุบัน                                                           |
| `customDataSource` | `any[]`                      | `undefined`    | Array กำหนดเองเพื่อวาด Radio Group ทันทีใน Memory (Deep Clone ป้องกันบั๊กให้อัตโนมัติ)       |
| `disabled`         | `boolean`                    | `false`        | ปิดการกดปุ่ม Radio ทั้งชุด                                                                   |
| `layout`           | `'horizontal' \| 'vertical'` | `'horizontal'` | การจัดเรียง (แนวนอน/แนวตั้ง)                                                                 |
| `autoDefault`      | `boolean`                    | `true`         | หากตั้งเป็น true ระบบจะดึงข้อมูลตัวแรกไปเป็นค่า value ตั้งต้นให้อัตโนมัติ (ถ้ายังไม่ได้เซ็ต) |
| `cascadeBy`        | `any`                        | `undefined`    | ค่าอ้างอิง หากเปลี่ยนจะคืนค่าก้อนนี้กลับไปเป็นค่าเริ่มต้นและดึงข้อมูลใหม่                    |
| `ignoreValue`      | `string[]`                   | `[]`           | ใส่รายการ `value` ที่ต้องการซ่อนไปจากตัวเลือก                                                |
| `displayExpr`      | `string`                     | `'text'`       | ชื่อฟิลด์ใน Object สำหรับโชว์คำอธิบาย (Label)                                                |
| `valueExpr`        | `string`                     | `'value'`      | ชื่อฟิลด์ใน Object สำหรับเก็บค่า (Value)                                                     |

### Outputs (`@Output`)

| Event            | Event Object        | Description                                                                                |
| :--------------- | :------------------ | :----------------------------------------------------------------------------------------- |
| `onValueChanged` | `ValueChangedEvent` | Event จาก DevExtreme แจ้งเตือนเมื่อค่าวิทยุถูกเปลี่ยน (เช็คค่าที่เลือกผ่าน `$event.value`) |
