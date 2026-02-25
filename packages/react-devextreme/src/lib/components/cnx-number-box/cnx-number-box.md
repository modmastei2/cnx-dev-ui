# NumberBox Component (`<CnxNumberBox>`)

Component สำหรับกรอกตัวเลขที่ครบวงจรของฝั่ง React ครอบทับ `NumberBox` ของ DevExtreme เพื่อบังคับการตั้งค่ารูปแบบทศนิยม การป้องกันตัวอักษรแปลกปลอม และจัดการพฤติกรรมระหว่างการ Focus/Blur ได้อย่างมีประสิทธิภาพ

## ✨ คุณสมบัติเด่น (Features)

- **Number Filtering**: คุณสามารถเลือก `numberType` เป็นค่าบวก ลบ หรือเปอร์เซ็นต์ได้ทันที โดยคอมโพเนนต์จะควบคุม Min/Max ให้เอง
- **Format Auto-Switch**: สลับการแสดงผลแบบมี Commas (เช่น 1,000.00) ตอนใช้งาน และรูปแบบเปล่าตอน Focus กรอกข้อมูลให้โดยอัตโนมัติ
- **Smart Decimal Rules**: จำกัดจำนวนเต็ม `integer` และวิเคราะห์หลักทศนิยมจาก `format` ของคุณเอง
- **Block Arrows**: สามารถปิดลูกศรขึ้น/ลง (`disableArrow`) ภายในกล่องคีย์บอร์ดได้ทันที
- **Default Value Fallback**: สามารถบังคับไม่ให้เป็นค่าว่าง (`allowEmpty = false`) เมื่อผู้ใช้ลบข้อมูลออก ตัวเลขจะเด้งกลับไปที่ `0`

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### การแสดงผลใน Component

```tsx
import React, { useState } from 'react';
import { CnxNumberBox } from '@cnx-dev/react-devextreme';

export const MyForm: React.FC = () => {
    const [price, setPrice] = useState<number | null>(null);

    return (
        <div>
            {/* รองรับตัวเลข 0 เท่านั้น ห้ามลบว่าง */}
            <CnxNumberBox value={0} allowEmpty={false} disableArrow={true} />

            {/* ช่องกรอกทศนิยม ไม่เอาค่าติดลบ จำกัดหลักหน้าจุดทศนิยม 5 หลัก */}
            <CnxNumberBox value={price} format="#,##0.00" numberType="positive" integer={5} onValueChanged={(e) => setPrice(e.value)} />

            {/* เปอร์เซ็นต์ (ไม่เกิน 100) */}
            <CnxNumberBox format="#,##0.00 %" numberType="positivePercent" />
        </div>
    );
};
```

---

## ⚙️ Properties & Events (API Reference)

### Props

| Property       | Type                                                                 | Default     | Description                                                                                                                                                |
| :------------- | :------------------------------------------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`        | `number \| null`                                                     | `null`      | ค่าตัวเลขเริ่มต้น                                                                                                                                          |
| `format`       | `string`                                                             | `'#,##0'`   | Format ของตัวเลขตอนเสียโฟกัส เช่น `#,#0` หรือ `#,#0.00`                                                                                                    |
| `numberType`   | `'positive' \| 'negative' \| 'percent' \| 'positivePercent' \| null` | `null`      | จำกัดขอบเขตของตัวเลข: <br>- `positive` = 0 เป็นต้นไป<br>- `negative` = ดึงติดลบอย่างเดียว<br>- `percent` = -100 ถึง 100<br>- `positivePercent` = 0 ถึง 100 |
| `integer`      | `number`                                                             | `0`         | จำนวนหลักสูงสุด **หน้า** จุดทศนิยม (รวมทศนิยมทั้งหมดต้องไม่เกิน 15 หลักตามลิมิตของ Dx)                                                                     |
| `max`          | `number`                                                             | `null`      | ค่าสูงสุดที่กรอกได้ (หากใส่ `numberType` มา คอมโพเนนต์จะตั้งค่า max นี้ให้เอง)                                                                             |
| `min`          | `number`                                                             | `null`      | ค่าต่ำสุดที่กรอกได้                                                                                                                                        |
| `disabled`     | `boolean`                                                            | `false`     | ปิดการใช้งานฟิลด์                                                                                                                                          |
| `allowEmpty`   | `boolean`                                                            | `false`     | อนุญาตให้ปล่อยกล่องว่างมั้ย (ถ้า Set ว่า False ตอนผู้ใช้เคลียร์ข้อมูล มันจะเด้ง 0 ใส่กลับเข้าไป)                                                           |
| `disableArrow` | `boolean`                                                            | `false`     | บล็อคปุ่ม Arrow Up/Down บนคีย์บอร์ดตอน Focus อยู่ ไม่ให้ค่าเปลี่ยนเอง                                                                                      |
| `id`           | `string`                                                             | `''`        | ID ขอกล่อง                                                                                                                                                 |
| `name`         | `string`                                                             | `''`        | Name Property สำหรับ Form Control                                                                                                                          |
| `tabIndex`     | `number`                                                             | `undefined` | ลำดับการ Focus เมื่อกดปุ่ม Tab                                                                                                                             |

### Events

| Event            | Event Object                                 | Description                                                                                                         |
| :--------------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `onValueChanged` | `ValueChangedEvent & { fromInit?: boolean }` | ทำงานเมื่อข้อมูลเปลี่ยน. ถ้าคืนค่า 0 อันเกิดจากพฤติกรรม `allowEmpty=false` Event จะแนบ `.fromInit = true` มาให้ด้วย |
| `onPaste`        | `EventInfo`                                  | ตรวจจับเมื่อผู้ใช้วางข้อมูล (Ctrl + V)                                                                              |
| `onEnterKey`     | `void`                                       | กดปุ่ม Enter ในขณะ Focus กล่องตัวเลข                                                                                |
