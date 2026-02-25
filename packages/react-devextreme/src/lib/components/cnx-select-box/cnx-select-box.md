# SelectBox Component (`<CnxSelectBox>`)

Component สำหรับแสดงผล Dropdown ของฝั่ง React ที่ถูกครอบทับ `SelectBox` ของ DevExtreme โดยออกแบบมาเพื่อดึงข้อมูลแบบ Dynamic ผ่าน React Context (แทน Dependency Injection ใน Angular) ทำให้โค้ด UI สะอาด และนำไปใช้ซ้ำได้ง่าย

## ✨ คุณสมบัติเด่น (Features)

- **Context Provider**: ไม่ผูกติดกับ API ตรงๆ แต่ทำงานผ่าน `SelectBoxDataProviderContext`
- **Dynamic Data Source**: จัดการ Pagination และ Search API ให้ภายในตัว
- **Cascade By**: รองรับการกรองข้อมูลแบบมีเงื่อนไข (เช่น เลือกบัญชีธนาคาร ตามธนาคารที่เลือกไว้)
- **Ignore Value**: สามารถกำหนด Array ของ `value` ที่ไม่ต้องแสดงใน Dropdown ได้ออนไฟลท
- **Custom Data Source**: สามารถโยน Array หรือ DataSource เข้ามาตรงๆ โดยไม่ต้องพึ่ง Service หรือ Context
- **IntelliSense Ready**: รองรับ TypeScript Declaration Merging (`ModuleSelectBoxKeys`) ให้แจ้งเตือน Key ของโปรเจกต์อัตโนมัติ

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Context Provider

ในส่วน Root หรือระดับบนสุดของแอปพลิเคชัน (หรือระดับที่ต้องการใช้งาน) ให้คุณครอบ `SelectBoxDataProviderContext.Provider` และป้อน Service/Object ที่สร้างขึ้นไว้ให้

```tsx
import React from 'react';
import { SelectBoxDataProviderContext } from '@cnx-dev/react-devextreme';
import { appSelectBoxService } from './services/app-select-box.service';
import App from './App';

export const Root: React.FC = () => {
    return (
        // 1. นำเข้า Context พร้อมกำหนด Service ที่ implement SelectBoxDataProvider
        <SelectBoxDataProviderContext.Provider value={appSelectBoxService}>
            <App />
        </SelectBoxDataProviderContext.Provider>
    );
};
```

### 2. การสร้าง Data Provider Service

ต้องสร้าง Object หรือ Class/Service ที่ Implement interface `SelectBoxDataProvider` เพื่อจัดการลอจิกการดึงข้อมูลตาม API ของโปรเจกต์เอง

```typescript
import { SelectBoxDataProvider, SelectBoxKey, SelectBoxParam, SelectBoxLoadResult } from '@cnx-dev/react-devextreme';

export const appSelectBoxService: SelectBoxDataProvider = {
    getService: async (key: SelectBoxKey | null | undefined, param: SelectBoxParam): Promise<SelectBoxLoadResult> => {
        if (key === 'bank') {
            const data = [{ text: 'ธนาคารกรุงเทพ', value: 'BBL', dropdownText: 'BBL - ธนาคารกรุงเทพ' }];
            return { data: data, totalCount: data.length, hasInitialValue: false };
        }
        return { data: [], totalCount: 0 };
    },
};
```

### 3. การแสดงผลใน Component

```tsx
import React, { useState } from 'react';
import { CnxSelectBox } from '@cnx-dev/react-devextreme';

export const MyForm: React.FC = () => {
    const [selectedBank, setSelectedBank] = useState<string | null>(null);

    return (
        <div>
            {/* แบบพื้นฐาน (ดึงข้อมูลผ่าน Context โดยใช้ selectBoxKey) */}
            <CnxSelectBox selectBoxKey="bank" placeholder="เลือกธนาคาร..." value={selectedBank} onValueChanged={(e) => setSelectedBank(e.value)} />

            {/* แบบ Cascade (บัญชีที่ผูกกับธนาคาร) */}
            <CnxSelectBox selectBoxKey="bankAccount" cascadeBy={selectedBank} disabled={!selectedBank} />

            {/* แบบ Custom DataSource (ไม่ต้องพึ่ง API หรือ Context) */}
            <CnxSelectBox customDataSource={[{ text: 'กำหนดเอง 1', value: 1 }]} placeholder="เลือกข้อมูลกำหนดเอง..." />
        </div>
    );
};
```

### 4. การตั้งค่า Auto-Complete ให้กับ SelectBoxKey (TypeScript)

โดยค่าเริ่มต้น `selectBoxKey` จะสามารถรับค่า `string` อะไรก็ได้ แต่สามารถให้ IDE ช่วยทำ Auto-Complete แจ้งเตือน Key ของแอปตัวเองได้โดยใช้ **Declaration Merging**:

สร้างไฟล์ `select-box-keys.d.ts` (หรือประกาศไว้ในส่วนใดก็ได้ของโปรเจกต์ React):

```typescript
declare module '@cnx-dev/react-devextreme' {
    export interface ModuleSelectBoxKeys {
        bank: any;
        department: any;
        currency: any;
    }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Props

| Property           | Type               | Default              | Description                                                             |
| :----------------- | :----------------- | :------------------- | :---------------------------------------------------------------------- |
| `selectBoxKey`     | `SelectBoxKey`     | `null`               | Key ที่ใช้ระบุประเภทข้อมูลสำหรับส่งให้ Data Provider เช่น `'bank'`      |
| `id`               | `string`           | `''`                 | **(บังคับ)** ID สำหรับอ้างอิงจุดประสงค์เฉพาะ                            |
| `name`             | `string`           | `''`                 | **(บังคับ)** Name สำหรับ form binding                                   |
| `value`            | `string \| number` | `''`                 | ค่าที่ถูกเลือกตั้งต้น                                                   |
| `customDataSource` | `any[]`            | `undefined`          | โยน Array ให้ทำงานตรงๆ (ถ้าใส่ค่านี้ จะข้ามการทำงานของ Context Service) |
| `placeholder`      | `string`           | `'Please select...'` | ข้อความแสดงเมื่อยังไม่มีการเลือก                                        |
| `disabled`         | `boolean`          | `false`              | ปิดการใช้งานฟิลด์                                                       |
| `cascadeBy`        | `any`              | `undefined`          | ค่า Parent ที่ใช้กรองข้อมูลลูก (เช่น ส่ง id ธนาคารไปให้ Data Provider)  |
| `ignoreValue`      | `any[]`            | `undefined`          | รายการของ `value` ที่ต้องการซ่อนไม่ให้แสดงในตัวเลือกชั่วคราว            |
| `displayExpr`      | `string`           | `'text'`             | ชื่อฟิลด์ใน Object สำหรับโชว์ข้อความที่ถูกเลือก                         |
| `valueExpr`        | `string`           | `'value'`            | ชื่อฟิลด์ใน Object สำหรับเป็นค่า value ตัวแทน                           |
| `searchExpr`       | `string`           | `'dropdownText'`     | Field ที่ใช้ค้นหาข้อความ                                                |
| `dropdownExpr`     | `string`           | `'dropdownText'`     | Field ที่นำมาแสดงใน List Dropdown                                       |
| `searchEnabled`    | `boolean`          | `true`               | เปิดปิดการพิมพ์ค้นหา                                                    |
| `searchTimeout`    | `number`           | `500`                | หน่วงเวลาค้นหา (Debounce) (มิลลิวินาที)                                 |
| `showClearButton`  | `boolean`          | `true`               | แสดงปุ่มลบ (กากบาท) ท้ายกล่องหรือไม่                                    |
| `width`            | `string \| number` | `'100%'`             | ความกว้างของกล่อง Input                                                 |
| `dropdownWidth`    | `string \| number` | `undefined`          | ความกว้างของ Dropdown ตอนกดกางออก                                       |
| `maxLength`        | `number`           | `0`                  | จำกัดความยาวตัวอักษรพิมพ์ค้นหาสูงสุด                                    |

### Events

| Event            | Event Object                           | Description                                          |
| :--------------- | :------------------------------------- | :--------------------------------------------------- |
| `onValueChanged` | `{ value: any, component: SelectBox }` | ทำงานเมื่อผู้ใช้เปลี่ยนค่าที่เลือก (Dropdown)        |
| `onEnterKey`     | `void`                                 | ทำงานเมื่อผู้ใช้กดปุ่ม Enter ขณะที่โฟกัสอยู่ใน Input |
