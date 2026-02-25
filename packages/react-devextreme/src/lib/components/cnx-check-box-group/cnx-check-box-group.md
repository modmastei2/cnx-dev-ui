# CheckBoxGroup Component (`<CnxCheckBoxGroup>`)

Component สำหรับแสดงผลกลุ่มของ CheckBox ที่ถูกออกแบบมาเพื่อครอบทับ `CheckBox` ของ DevExtreme โดยมีระบบจัดการ State ภายในตัว รองรับการผูกข้อมูลทั้งแบบ Array ใน Memory และดึงผ่าน Context (ทดแทน Dependency Injection ของฝั่ง Angular)

## ✨ คุณสมบัติเด่น (Features)

- **Context Provider**: สามารถดึงข้อมูลผ่าน API ยืดหยุ่นผ่าน `CheckBoxDataProviderContext`
- **Single / Multiple Select**: สามารถสลับโหมดให้เลือกได้หลายข้อ หรือบีบให้เลือกได้ข้อเดียว (พฤติกรรมคล้าย Radio)
- **Direction Layout**: จัดเรียงตัวเลือกเป็นแนวตั้ง (`col`) หรือแนวนอน (`row`) ได้ง่ายๆ
- **Cascade By**: รองรับการโหลดข้อมูลใหม่เมื่อเงื่อนไข (Cascade) เปลี่ยนแปลง
- **Custom Expressions**: สามารถกำหนด `displayExpr` และ `valueExpr` สำหรับโยน Object แปลกๆ เข้ามาแสดงได้อิสระ
- **Ignore Value**: กรองเอาตัวเลือกที่ไม่ต้องการแสดงออกไปได้ทันที

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Context Provider

นำเข้า Context และใช้ Provider ครอบที่ระดับ Root ของเอกสาร

```tsx
import React from 'react';
import { CheckBoxDataProviderContext } from '@cnx-dev/react-devextreme';
import { appCheckBoxService } from './services/app-check-box.service';
import App from './App';

export const Root: React.FC = () => {
    return (
        <CheckBoxDataProviderContext.Provider value={appCheckBoxService}>
            <App />
        </CheckBoxDataProviderContext.Provider>
    );
};
```

### 2. การสร้าง Data Provider Service

ต้องสร้าง Service ที่ Implement `CheckBoxDataProvider` เพื่อจัดการลอจิกการดึงข้อมูล

```typescript
import { CheckBoxDataProvider, CheckBoxKey, CheckBoxParam, CheckBoxViewModel } from '@cnx-dev/react-devextreme';

export const appCheckBoxService: CheckBoxDataProvider = {
    getService: async (key: CheckBoxKey | null | undefined, param: CheckBoxParam): Promise<CheckBoxViewModel[]> => {
        if (key === 'BANK') {
            return [
                { text: 'ธนาคารกรุงเทพ', value: 'BBL' },
                { text: 'ธนาคารกสิกรไทย', value: 'KBANK' },
            ];
        }
        return [];
    },
};
```

### 3. การแสดงผลใน Component

```tsx
import React, { useState } from 'react';
import { CnxCheckBoxGroup } from '@cnx-dev/react-devextreme';

export const MyForm: React.FC = () => {
    const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
    const customItems = [
        { name: 'กรุงเทพมหานคร', identifier: 'BKK' },
        { name: 'เชียงใหม่', identifier: 'CNX' },
    ];

    return (
        <div>
            {/* แบบเรียกผ่าน API (ใช้ checkBoxKey) แนวตั้ง */}
            <CnxCheckBoxGroup checkBoxKey="BANK" value={selectedBanks} onValueChanged={(e) => setSelectedBanks(e.value)} />

            {/* แบบพื้นฐาน แนวนอน เลือกข้อเดียว (โยน Array ผ่าน customDataSource) */}
            <CnxCheckBoxGroup customDataSource={customItems} mode="single" direction="row" displayExpr="name" valueExpr="identifier" />
        </div>
    );
};
```

### 4. การตั้งค่า Auto-Complete ให้กับ CheckBoxKey (TypeScript)

สามารถให้ IDE ช่วยทำ Auto-Complete แจ้งเตือน Key เฉพาะของแอปตัวเองได้ โดยใช้ **Declaration Merging**:

```typescript
declare module '@cnx-dev/react-devextreme' {
    export interface ModuleCheckBoxKeys {
        BANK: any;
        PROVINCE: any;
    }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Props

| Property           | Type                     | Default      | Description                                                                  |
| :----------------- | :----------------------- | :----------- | :--------------------------------------------------------------------------- |
| `checkBoxKey`      | `CheckBoxKey`            | `null`       | Key ระบุชุดข้อมูลสำหรับดึงจาก Context                                        |
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

### Events

| Event            | Event Object          | Description                                    |
| :--------------- | :-------------------- | :--------------------------------------------- |
| `onValueChanged` | `{ value: string[] }` | ทำงานเมื่อผู้ใช้กดติ๊ก/เอาออก CheckBox ในกลุ่ม |
