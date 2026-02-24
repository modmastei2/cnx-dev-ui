# NumberBox Component (`<cnx-number-box>`)

Component สำหรับกรอกตัวเลขที่ครบวงจร ครอบทับ `DxNumberBox` ของ DevExtreme เพื่อบังคับการตั้งค่ารูปแบบทศนิยม การป้องกันตัวอักษรแปลกปลอม และจัดการพฤติกรรมระหว่างการ Focus/Blur ได้อย่างมีประสิทธิภาพ

## ✨ คุณสมบัติเด่น (Features)

- **Number Filtering**: คุณสามารถเลือก `numberType` เป็นค่าบวก ลบ หรือเปอร์เซ็นต์ได้ทันที โดยคอมโพเนนต์จะควบคุม Min/Max ให้เอง
- **Format Auto-Switch**: สลับการแสดงผลแบบมี Commas (เช่น 1,000) ตอนใช้งาน และรูปแบบเปล่าตอน Focus กรอกข้อมูลให้โดยอัตโนมัติ
- **Smart Decimal Rules**: จำกัดจำนวนเต็ม `integer` และวิเคราะห์หลักทศนิยมจาก `format` ของคุณเอง
- **Block Arrows**: สามารถปิดลูกศรขึ้น/ลง (`disableArrow`) ภายในกล่องได้ทันที
- **Default Value Fallback**: สามารถบังคับไม่ให้เป็นค่าว่าง (`allowEmpty = false`) เมื่อผู้ใช้ลบข้อมูลออก ตัวเลขจะเด้งกลับไปที่ `0`

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Module

ใน `app.module.ts` ของโปรเจกต์ นำเข้า `CnxNumberBoxModule`

```typescript
import { NgModule } from '@angular/core';
import { CnxNumberBoxModule } from '@cnx-dev/angular-devextreme';

@NgModule({
  imports: [CnxNumberBoxModule],
})
export class AppModule {}
```

### 2. การสร้างและกำหนด Property ให้ผ่าน HTML

```html
<!-- รองรับตัวเลข 0 เท่านั้น ห้ามลบว่าง -->
<cnx-number-box [value]="0" [allowEmpty]="false" [disableArrow]="true"> </cnx-number-box>

<!-- ช่องกรอกทศนิยม ไม่เอาค่าติดลบ จำกัดหลักก่อนจุดไว้ที่ 5 หลัก -->
<cnx-number-box [value]="myPrice" format="#,##0.00" numberType="positive" [integer]="5" (onValueChanged)="onPriceChanged($event)"> </cnx-number-box>

<!-- เปอร์เซ็นต์ -->
<cnx-number-box format="#,##0.00 %" numberType="positivePercent"> </cnx-number-box>
```

---

## ⚙️ Properties & Events (API Reference)

### Inputs (`@Input`)

| Property       | Type                                                                 | Default   | Description                                                                                                                                                |
| :------------- | :------------------------------------------------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`        | `number`                                                             | `null`    | ค่าตัวเลขเริ่มต้น                                                                                                                                          |
| `format`       | `string`                                                             | `'#,##0'` | Format ของตัวเลขตอนเสียโฟกัส เช่น `#,#0` หรือ `#,#0.00`                                                                                                    |
| `numberType`   | `'positive' \| 'negative' \| 'percent' \| 'positivePercent' \| null` | `null`    | จำกัดขอบเขตของตัวเลข: <br>- `positive` = 0 เป็นต้นไป<br>- `negative` = ดึงติดลบอย่างเดียว<br>- `percent` = -100 ถึง 100<br>- `positivePercent` = 0 ถึง 100 |
| `integer`      | `number`                                                             | `0`       | จำนวนหลักสูงสุด **หน้า** จุดทศนิยม (รวมทศนิยมทั้งหมดต้องไม่เกิน 15 หลักตามลิมิตของ Dx)                                                                     |
| `max`          | `number`                                                             | `null`    | ค่าสูงสุดที่กรอกได้ (หากใส่ `numberType` มา คอมโพเนนต์จะตั้งค่า max นี้ให้เอง)                                                                             |
| `min`          | `number`                                                             | `null`    | ค่าต่ำสุดที่กรอกได้                                                                                                                                        |
| `disabled`     | `boolean`                                                            | `false`   | ปิดการใช้งานฟิลด์                                                                                                                                          |
| `allowEmpty`   | `boolean`                                                            | `false`   | อนุญาตให้ปล่อยกล่องว่างมั้ย (ถ้า Set ว่า False ตอนผู้ใช้เคลียร์ข้อมูล มันจะเด้ง 0 ใส่กลับเข้าไป)                                                           |
| `disableArrow` | `boolean`                                                            | `false`   | บล็อคปุ่ม Arrow Up/Down บนคีย์บอร์ดตอน Focus อยู่ ไม่ให้ค่าเปลี่ยนเอง                                                                                      |

### Outputs (`@Output`)

| Event            | Event Object        | Description                                                                                                             |
| :--------------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------- |
| `onValueChanged` | `ValueChangedEvent` | ทำงานเมื่อข้อมูลเปลี่ยน. ถ้าคืนค่า 0 อันเกิดจากพฤติกรรม `[allowEmpty]="false"` Event จะแนบ `.fromInit = true` มาให้ด้วย |
| `onPaste`        | `ClipboardEvent`    | ตรวจจับเมื่อผู้ใช้วางข้อมูล (Ctrl + V)                                                                                  |
| `onEnterKey`     | `void`              | กดปุ่ม Enter ในขณะ Focus กล่องตัวเลข                                                                                    |
