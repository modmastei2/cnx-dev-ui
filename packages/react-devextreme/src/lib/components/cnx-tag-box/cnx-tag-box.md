# TagBox Component (`<CnxTagBox>`)

Component สำหรับแสดงผลการเลือกข้อมูลได้หลายค่า (Multiple selection) ของฝั่ง React โดยครอบทับ `TagBox` ของ DevExtreme ออกแบบมาให้รองรับการดึงข้อมูลแบบ Dynamic ผ่าน React Context และทำงานร่วมกับ DataSource เดียวกันแบบ SelectBox

## ✨ คุณสมบัติเด่น (Features)

- **Context Provider**: ทำงานผ่าน `TagBoxDataProviderContext` ช่วยลดความซ้ำซ้อนของโค้ดดึงข้อมูลแทนการผูก API โดยตรง
- **Multiple Selection**: รองรับการเลือกหลายรายการพร้อมกัน (Array of Strings/Numbers)
- **Custom Data Source**: สามารถส่งข้อมูลแบบ Array เข้าไปได้ตรงๆ
- **Cascade By**: รองรับการกรองโชว์ข้อมูลล้อตามค่า Parent
- **Tag Limiting**: สามารถกำหนดจำนวนสูงสุดของ Tag ที่จะแสดงผลได้ผ่าน `maxDisplayedTags`

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Context Provider

เช่นเดียวกับ SelectBox ให้คุณครอบ Context `TagBoxDataProviderContext.Provider` ในแอปของคุณ

```tsx
import React from 'react';
import { TagBoxDataProviderContext } from '@cnx-dev/react-devextreme';
import { appTagBoxService } from './services/app-tag-box.service';
import App from './App';

export const Root: React.FC = () => {
    return (
        <TagBoxDataProviderContext.Provider value={appTagBoxService}>
            <App />
        </TagBoxDataProviderContext.Provider>
    );
};
```

### 2. การสร้าง Data Provider Service

ต้องสร้าง Object/Service ที่ Implement `TagBoxDataProvider`

```typescript
import { TagBoxDataProvider, TagBoxKey, TagBoxParam, TagBoxLoadResult } from '@cnx-dev/react-devextreme';

export const appTagBoxService: TagBoxDataProvider = {
    getService: async (key: TagBoxKey | null | undefined, param: TagBoxParam): Promise<TagBoxLoadResult> => {
        if (key === 'roles') {
            const data = [
                { text: 'Admin', value: '1', dropdownText: '1 - Admin' },
                { text: 'User', value: '2', dropdownText: '2 - User' },
            ];
            return { data: data, totalCount: data.length, hasInitialValue: false };
        }
        return { data: [], totalCount: 0 };
    },
};
```

### 3. การแสดงผลใน Component

```tsx
import React, { useState } from 'react';
import { CnxTagBox } from '@cnx-dev/react-devextreme';

export const MyForm: React.FC = () => {
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    return (
        <div>
            {/* แบบดึงข้อมูลจาก Context ตามชื่อ Key */}
            <CnxTagBox tagBoxKey="roles" placeholder="Choose roles..." value={selectedRoles} onValueChanged={(e) => setSelectedRoles(e.value as string[])} />

            {/* แบบกำหนดข้อมูลเอง (ไม่ต้องผ่าน Context) */}
            <CnxTagBox customDataSource={[{ text: 'Member', id: '3' }]} displayExpr="text" valueExpr="id" />
        </div>
    );
};
```

### 4. การตั้งค่า Auto-Complete ให้กับ TagBoxKey (TypeScript)

สามารถพ่วงชื่อ Key ลงไปใน Environment เพื่อใช้ทำ Auto-Complete ได้:

```typescript
declare module '@cnx-dev/react-devextreme' {
    export interface ModuleTagBoxKeys {
        roles: any;
        projects: any;
    }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Props

| Property                | Type               | Default              | Description                                                    |
| :---------------------- | :----------------- | :------------------- | :------------------------------------------------------------- |
| `tagBoxKey`             | `TagBoxKey`        | `null`               | Key ระบุข้อมูลส่งเข้า Service Provider                         |
| `id`                    | `string`           | `''`                 | **(บังคับ)** ID สำหรับอ้างอิงจุดประสงค์เฉพาะ                   |
| `name`                  | `string`           | `''`                 | **(บังคับ)** Name สำหรับ form binding                          |
| `value`                 | `string[]`         | `[]`                 | ค่าที่เลือกอยู่ (Array of Strings/Numbers)                     |
| `customDataSource`      | `any[]`            | `undefined`          | ข้อมูล Array กำหนดเอง (ข้าม Service Context)                   |
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
| `maxDisplayedTags`      | `number`           | `undefined`          | จำนวนป้าย Tag สูงสุดบนหน้าจอที่แสดงได้ (ส่วนเกินจะกลายเป็น ..) |
| `width`                 | `string \| number` | `'100%'`             | ความกว้างของกล่อง Input                                        |
| `dropdownWidth`         | `string \| number` | `undefined`          | ความกว้างของ Dropdown ตอนกดกางออก                              |
| `maxLength`             | `number`           | `0`                  | จำกัดความยาวตัวอักษรพิมพ์ค้นหาสูงสุด                           |

### Events

| Event            | Event Object                        | Description                              |
| :--------------- | :---------------------------------- | :--------------------------------------- |
| `onValueChanged` | `{ value: any, component: TagBox }` | ทำงานเมื่อผู้ใช้เพิ่มหรือลดจำนวนที่เลือก |
| `onEnterKey`     | `void`                              | กดปุ่ม Enter ในขณะ Focus                 |
