# DateBox Component (`<cnx-date-box>`)

Component สำหรับกรอกและเลือกวันที่ ที่ครอบทับ `DxDateBox` ของ DevExtreme ออกแบบมาให้ง่ายต่อการตั้งค่าวันหยุด วันที่เลือกไม่ได้ (disabled dates) และรูปแบบการแสดงผลที่กำหนดได้เอง

## ✨ คุณสมบัติเด่น (Features)

- **Holiday Highlighting**: รองรับการส่ง Array ของวันที่ที่ต้องการกำหนดให้เป็นวันหยุด ระบบจะแสดงผลในปฏิทินด้วยคลาส `holiday-cell` ให้โดยอัตโนมัติ
- **Date Constraints**: กำหนด `minDate` และ `maxDate` ได้ทันที
- **Auto Default**: สามารถให้กล่องกำหนดค่าเริ่มต้นเป็นวันที่ปัจจุบัน (Today) ได้ทันทีหากปล่อยว่าง
- **Empty Handling**: ป้องกันการลบข้อมูลออกจนหมด (กลับเป็นวันที่ล่าสุดให้ทันทีหาก `allowEmpty` เป็น `false`)
- **Format Consistency**: ควบคุม `format` วันที่ตรงกันระหว่างการพิมพ์และการแสดงผล

---

## 🛠️ ขั้นตอนการนำไปใช้งาน (Usage Instructions)

### 1. การตั้งค่า Module

ใน `app.module.ts` ของโปรเจกต์ นำเข้า `CnxDateBoxModule`

```typescript
import { NgModule } from '@angular/core';
import { CnxDateBoxModule } from '@cnx-dev/angular-devextreme';

@NgModule({
  imports: [CnxDateBoxModule],
})
export class AppModule {}
```

### 2. การสร้างและกำหนด Property ให้ผ่าน Controller

```typescript
import { Component } from '@angular/core';

@Component({
  template: ` <cnx-date-box [value]="currentDate" [disabledDates]="companyHolidays" [maxDate]="maxAllowedDate" [allowEmpty]="false" (onValueChanged)="onDateChanged($event)"> </cnx-date-box> `,
})
export class MyComponent {
  currentDate = new Date();
  maxAllowedDate = new Date(2025, 11, 31);

  // วันหยุด (ระบุเป็น string หรือ Date 객체 ก็ได้)
  companyHolidays = ['2024-04-13', '2024-04-14', '2024-04-15'];

  onDateChanged(event: any) {
    console.log('วันที่ถูกเลือกใหม่แพทเทิร์น yyyy-MM-dd:', event.value);
  }
}
```

---

## ⚙️ Properties & Events (API Reference)

### Inputs (`@Input`)

| Property          | Type                 | Default         | Description                                                                            |
| :---------------- | :------------------- | :-------------- | :------------------------------------------------------------------------------------- |
| `value`           | `string \| Date`     | `null`          | วันที่ที่ถูกเลือกอยู่                                                                  |
| `placeholder`     | `string`             | `''`            | ข้อความช่องว่างตอนยังไม่เลือกวันที่                                                    |
| `disabled`        | `boolean`            | `false`         | ปิดการใช้งานฟิลด์                                                                      |
| `minDate`         | `string \| Date`     | `undefined`     | วันที่น้อยที่สุดที่สามารถเลือกได้                                                      |
| `maxDate`         | `string \| Date`     | `undefined`     | วันที่มากที่สุดที่สามารถเลือกได้                                                       |
| `disabledDates`   | `string[] \| Date[]` | `[]`            | วันที่ที่ห้ามเลือก / ถูกนับว่าเป็นวันหยุด (จะมี CSS highlight วันหยุดให้ด้วย)          |
| `allowEmpty`      | `boolean`            | `true`          | อนุญาตให้ช่องว่างเปล่าได้ (ถ้า `false` แล้วเคลียร์ค่า มันจะเด้งกลับเป็นวันปัจจุบันแทน) |
| `autoDefault`     | `boolean`            | `false`         | ตั้งค่าเริ่มต้นเป็นเวลาปัจจุบันตั้งแต่ตอนเอนจิ้น Render เสร็จ ถ้าไม่มี value ตอน init  |
| `format`          | `string`             | `'dd-MMM-yyyy'` | Format String กำหนดรูปแบบของ DateBox                                                   |
| `width`           | `number \| string`   | `110`           | ความกว้างของกล่องข้อความ                                                               |
| `calendarOptions` | `dxCalendarOptions`  | -               | ส่งออปชันระดับลึกสำหรับปฏิทินของ DevExtreme                                            |

### Outputs (`@Output`)

| Event            | Event Object        | Description                                                                |
| :--------------- | :------------------ | :------------------------------------------------------------------------- |
| `onValueChanged` | `ValueChangedEvent` | ทำงานเมื่อมีการเปลี่ยนวันที่ (ส่ง Event แนบพร้อม Format yyyy-MM-dd กลับมา) |
| `onEnterKey`     | `void`              | กดปุ่ม Enter ในขณะ Focus กล่องวันที่                                       |
