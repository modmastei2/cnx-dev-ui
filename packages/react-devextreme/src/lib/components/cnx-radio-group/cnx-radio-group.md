# RadioGroup Component (`<CnxRadioGroup>`)

Component สำหรับแสดงผลตัวเลือกปุ่มวิทยุ (Radio) แบบเลือกได้ข้อเดียวของฝั่ง React ครอบทับ `RadioGroup` ของ DevExtreme ออกแบบมาให้รองรับการดึงข้อมูลจาก API แบบพลวัต (Dynamic) ผ่าน Context แบบฉีดเข้าลึก และจัดการค่า Auto-default ได้ในตัว

## ✨ คุณสมบัติเด่น (Features)

- **Context Provider**: ดึงข้อมูลแยกตามประเภทจากศูนย์กลางผ่าน `RadioGroupDataProviderContext`
- **Auto Default**: สามารถสั่งให้เลือกค่าแรกในลิสต์อัตโนมัติ (เป็น Default ล่วงหน้า) หากไม่ได้ล็อกค่าตั้งต้นไว้
- **Flexible Layout**: มีให้เลือกจัดเรียงแนวนอน (`horizontal`) หรือแนวตั้ง (`vertical`)
- **Custom Expressions**: สามารถชี้ตัวแปร `displayExpr` และ `valueExpr` เพื่อนำ Object ชนิดใดก็ได้มาทำ Radio
- **Cascade Trigger**: อัปเดตข้อมูลลอจิกอัตโนมัติทันทีที่ค่าอ้างอิงของแม่ (Cascade) เปลี่ยนแปลง

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Context Provider

นำเข้า Context และใช้ Provider ครอบที่ระดับ Root ของเอกสาร

```tsx
import React from 'react';
import { RadioGroupDataProviderContext } from '@cnx-dev/react-devextreme';
import { appRadioGroupService } from './services/app-radio-group.service';
import App from './App';

export const Root: React.FC = () => {
    return (
        <RadioGroupDataProviderContext.Provider value={appRadioGroupService}>
            <App />
        </RadioGroupDataProviderContext.Provider>
    );
};
```

### 2. การสร้าง Data Provider Service

สร้าง Object/Service ที่ Implement `RadioGroupDataProvider` โดยสามารถส่งค่า Object ธรรมดากลับไปเพื่อให้ Component แปลงเป็นรูปแบบ Radio ได้เอง

```typescript
import { RadioGroupDataProvider, RadioGroupKey, RadioGroupParam, RadioGroupViewModel } from '@cnx-dev/react-devextreme';

export const appRadioGroupService: RadioGroupDataProvider = {
    getService: async (key: RadioGroupKey | null | undefined, param: RadioGroupParam): Promise<RadioGroupViewModel[]> => {
        if (key === 'STATUS') {
            return [
                { text: 'ใช้งาน', value: 'ACTIVE' },
                { text: 'ระงับการใช้งาน', value: 'INACTIVE' },
            ];
        }
        return [];
    },
};
```

### 3. การแสดงผลใน Component

```tsx
import React, { useState } from 'react';
import { CnxRadioGroup } from '@cnx-dev/react-devextreme';

export const MyForm: React.FC = () => {
    const [currentStatus, setCurrentStatus] = useState<string>('');
    const statusItems = [
        { name: 'ใช้งาน', customID: 'ACTIVE' },
        { name: 'ระงับการใช้งาน', customID: 'INACTIVE' },
    ];

    return (
        <div>
            {/* แบบพื้นฐาน (โยน Array ผ่าน customDataSource + Horizontal ธรรมดา) */}
            <CnxRadioGroup customDataSource={statusItems} value={currentStatus} displayExpr="name" valueExpr="customID" onValueChanged={(e) => setCurrentStatus(e.value)} />

            {/* แบบไม่เอาค่า Auto Default ข้อแรก (บังคับว่างจนกว่าจะกด) */}
            <CnxRadioGroup customDataSource={statusItems} autoDefault={false} />

            {/* แบบเรียก API ผ่าน radioGroupKey (เรียงแนวตั้ง) */}
            <CnxRadioGroup radioGroupKey="STATUS" layout="vertical" value={currentStatus} onValueChanged={(e) => setCurrentStatus(e.value)} />
        </div>
    );
};
```

### 4. การตั้งค่า Auto-Complete ให้กับ RadioGroupKey (TypeScript)

โดยค่าเริ่มต้น `radioGroupKey` จะสามารถรับค่า `string` อะไรก็ได้ แต่คุณสามารถให้ IDE ช่วยทำ Auto-Complete แจ้งเตือน Key เฉพาะของแอปตัวเองได้ โดยใช้ **Declaration Merging**:

```typescript
declare module '@cnx-dev/react-devextreme' {
    export interface ModuleRadioGroupKeys {
        STATUS: any;
        GENDER: any;
    }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Props

| Property           | Type                         | Default        | Description                                                                                  |
| :----------------- | :--------------------------- | :------------- | :------------------------------------------------------------------------------------------- |
| `radioGroupKey`    | `RadioGroupKey`              | `null`         | Key สำหรับร้องขอชุดข้อมูลจาก Context                                                         |
| `id`               | `string`                     | `''`           | **(บังคับ)** ID หลัก                                                                         |
| `name`             | `string`                     | `''`           | **(บังคับ)** ชื่อก้อน Radio (ต้องเหมือนกันเพื่อให้เลือกได้ชอยส์เดียวในกลุ่ม)                 |
| `value`            | `string`                     | `''`           | ค่าที่มีการเลือกเอาไว้อยู่ปัจจุบัน                                                           |
| `customDataSource` | `any[]`                      | `undefined`    | Array กำหนดเองเพื่อวาด Radio Group ทันทีใน Memory                                            |
| `disabled`         | `boolean`                    | `false`        | ปิดการกดปุ่ม Radio ทั้งชุด                                                                   |
| `layout`           | `'horizontal' \| 'vertical'` | `'horizontal'` | การจัดเรียง (แนวนอน/แนวตั้ง)                                                                 |
| `autoDefault`      | `boolean`                    | `true`         | หากตั้งเป็น true ระบบจะดึงข้อมูลตัวแรกไปเป็นค่า value ตั้งต้นให้อัตโนมัติ (ถ้ายังไม่ได้เซ็ต) |
| `cascadeBy`        | `any`                        | `undefined`    | ค่าอ้างอิง หากเปลี่ยนจะคืนค่าก้อนนี้กลับไปเป็นค่าเริ่มต้นและดึงข้อมูลใหม่                    |
| `ignoreValue`      | `string[]`                   | `[]`           | ใส่รายการ `value` ที่ต้องการซ่อนไปจากตัวเลือก                                                |
| `displayExpr`      | `string`                     | `'text'`       | ชื่อฟิลด์ใน Object สำหรับโชว์คำอธิบาย (Label)                                                |
| `valueExpr`        | `string`                     | `'value'`      | ชื่อฟิลด์ใน Object สำหรับเก็บค่า (Value)                                                     |

### Events

| Event            | Event Object        | Description                                                                          |
| :--------------- | :------------------ | :----------------------------------------------------------------------------------- |
| `onValueChanged` | `ValueChangedEvent` | Event จาก DevExtreme แจ้งเตือนเมื่อค่าวิทยุถูกเปลี่ยน (เช็คค่าที่เลือกผ่าน `.value`) |
