# React MUI Component Library (`@cnx-dev/react-mui`)

Component library ที่ถูกสร้างขึ้นโดยใช้ **Material UI (MUI)** เป็น UI engine แทน DevExtreme โดยออกแบบมาให้มี API เดียวกันกับ `@cnx-dev/react-devextreme` เพื่อให้สลับการใช้งานได้ง่าย

```bash
npm install @cnx-dev/react-mui
```

**Peer Dependencies ที่ต้องติดตั้งเพิ่มเติม:**

```bash
npm install @mui/material @mui/icons-material @mui/x-date-pickers @emotion/react @emotion/styled date-fns
```

---

## 📦 Components

| Component          | MUI Base                          | Status     |
| :----------------- | :-------------------------------- | :--------- |
| `CnxSelectBox`     | `Autocomplete`                    | ✅ Ready   |
| `CnxCheckBoxGroup` | `FormGroup` + `Checkbox`          | ✅ Ready   |
| `CnxNumberBox`     | `TextField` + `Intl.NumberFormat` | ✅ Ready   |
| `CnxDateBox`       | `DatePicker` + `date-fns`         | ✅ Ready   |
| `CnxRadioGroup`    | `RadioGroup`                      | ✅ Ready   |
| `CnxTagBox`        | —                                 | ⏳ Pending |

---

## 🔧 CnxDataProvider (Context Setup)

เช่นเดียวกับ `react-devextreme` ต้องครอบ Context Provider ที่ Root ของแอปพลิเคชัน

```tsx
import { SelectBoxDataProviderContext, CheckBoxDataProviderContext, RadioGroupDataProviderContext } from '@cnx-dev/react-mui';

export const Root: React.FC = () => (
    <SelectBoxDataProviderContext.Provider value={appSelectBoxService}>
        <CheckBoxDataProviderContext.Provider value={appCheckBoxService}>
            <RadioGroupDataProviderContext.Provider value={appRadioGroupService}>
                <App />
            </RadioGroupDataProviderContext.Provider>
        </CheckBoxDataProviderContext.Provider>
    </SelectBoxDataProviderContext.Provider>
);
```

---

## 1. SelectBox (`<CnxSelectBox>`)

Component สำหรับแสดงผล Dropdown ที่ครอบทับ MUI `Autocomplete` รองรับ Server-side Search, Cascade, และ Custom DataSource

### ✨ คุณสมบัติเด่น

- **MUI Autocomplete**: รองรับ Search, Clear button, และ Loading state
- **Context Provider**: ดึงข้อมูลผ่าน `SelectBoxDataProviderContext`
- **Cascade By**: กรองข้อมูลตามเงื่อนไข Parent
- **Custom Data Source**: รับ Array โดยตรง ไม่ต้องพึ่ง Context
- **IntelliSense Ready**: รองรับ TypeScript Declaration Merging (`ModuleSelectBoxKeys`)

### 🛠️ การนำไปใช้งาน

#### 1. สร้าง Data Provider Service

```typescript
import type { SelectBoxDataProvider, SelectBoxKey, SelectBoxParam, SelectBoxLoadResult } from '@cnx-dev/react-mui';

export const appSelectBoxService: SelectBoxDataProvider = {
    getService: async (key, param): Promise<SelectBoxLoadResult> => {
        if (key === 'bank') {
            const data = [{ text: 'ธนาคารกรุงเทพ', value: 'BBL', dropdownText: 'BBL - ธนาคารกรุงเทพ' }];
            return { data, totalCount: data.length };
        }
        return { data: [], totalCount: 0 };
    },
};
```

#### 2. ใช้งานใน Component

```tsx
import { CnxSelectBox } from '@cnx-dev/react-mui';

<CnxSelectBox selectBoxKey="bank" placeholder="เลือกธนาคาร..." value={selectedBank} onValueChanged={(e) => setSelectedBank(e.value)} />;

{
    /* Cascade */
}
<CnxSelectBox selectBoxKey="bankAccount" cascadeBy={selectedBank} disabled={!selectedBank} />;

{
    /* Custom DataSource */
}
<CnxSelectBox customDataSource={[{ text: 'Option 1', value: 1, dropdownText: 'Option 1' }]} placeholder="เลือก..." />;
```

#### 3. TypeScript Auto-Complete สำหรับ Key

```typescript
declare module '@cnx-dev/react-mui' {
    export interface ModuleSelectBoxKeys {
        bank: any;
        department: any;
    }
}
```

### ⚙️ Props & Events

| Property           | Type               | Default              | Description                             |
| :----------------- | :----------------- | :------------------- | :-------------------------------------- |
| `selectBoxKey`     | `SelectBoxKey`     | `null`               | Key ส่งให้ Data Provider                |
| `id`               | `string`           | `''`                 | HTML id attribute                       |
| `name`             | `string`           | `''`                 | HTML name attribute                     |
| `value`            | `string \| number` | `null`               | ค่าที่ถูกเลือก                          |
| `customDataSource` | `any[]`            | `undefined`          | Array ข้อมูลโดยตรง (ข้ามการใช้ Context) |
| `placeholder`      | `string`           | `'Please select...'` | Placeholder text                        |
| `disabled`         | `boolean`          | `false`              | ปิดการใช้งาน                            |
| `cascadeBy`        | `any`              | `undefined`          | ค่า Parent สำหรับกรองข้อมูล             |
| `ignoreValue`      | `any[]`            | `undefined`          | รายการ value ที่ซ่อน                    |
| `displayExpr`      | `string`           | `'text'`             | Field สำหรับแสดงข้อความที่เลือก         |
| `valueExpr`        | `string`           | `'value'`            | Field สำหรับค่า value                   |
| `searchExpr`       | `string`           | `'dropdownText'`     | Field สำหรับค้นหา                       |
| `dropdownExpr`     | `string`           | `'dropdownText'`     | Field แสดงใน List                       |
| `searchEnabled`    | `boolean`          | `true`               | เปิด/ปิด Search                         |
| `searchTimeout`    | `number`           | `500`                | Debounce เวลาค้นหา (ms)                 |
| `showClearButton`  | `boolean`          | `true`               | แสดงปุ่ม Clear                          |
| `width`            | `string \| number` | `'100%'`             | ความกว้าง Input                         |
| `maxLength`        | `number`           | `0`                  | จำกัดความยาว Search Input               |

| Event            | Payload                    | Description           |
| :--------------- | :------------------------- | :-------------------- |
| `onValueChanged` | `{ value, previousValue }` | เมื่อผู้ใช้เปลี่ยนค่า |
| `onEnterKey`     | `void`                     | เมื่อกด Enter         |

---

## 2. CheckBoxGroup (`<CnxCheckBoxGroup>`)

Component กลุ่ม Checkbox ที่ครอบทับ MUI `FormGroup` รองรับ Multiple/Single selection และ Horizontal/Vertical layout

### ✨ คุณสมบัติเด่น

- **Layout**: รองรับ `horizontal` และ `vertical`
- **Mode**: เลือกได้ `multiple` หรือ `single`
- **Context Provider**: ดึงข้อมูลผ่าน `CheckBoxDataProviderContext`
- **IntelliSense Ready**: รองรับ `ModuleCheckBoxKeys`

### 🛠️ การนำไปใช้งาน

#### 1. สร้าง Data Provider Service

```typescript
import type { CheckBoxDataProvider, CheckBoxViewModel } from '@cnx-dev/react-mui';

export const appCheckBoxService: CheckBoxDataProvider = {
    getService: async (key, param): Promise<CheckBoxViewModel[]> => {
        if (key === 'status') {
            return [
                { value: 'active', text: 'Active' },
                { value: 'inactive', text: 'Inactive' },
            ];
        }
        return [];
    },
};
```

#### 2. ใช้งานใน Component

```tsx
import { CnxCheckBoxGroup } from '@cnx-dev/react-mui';

{
    /* ผ่าน Context */
}
<CnxCheckBoxGroup checkBoxKey="status" value={selectedStatus} layout="horizontal" onValueChanged={(e) => setSelectedStatus(e.value)} />;

{
    /* Custom DataSource */
}
<CnxCheckBoxGroup
    customDataSource={[
        { value: 'A', text: 'Option A' },
        { value: 'B', text: 'Option B' },
    ]}
    value={selected}
    mode="single"
    onValueChanged={(e) => setSelected(e.value)}
/>;
```

#### 3. TypeScript Auto-Complete

```typescript
declare module '@cnx-dev/react-mui' {
    export interface ModuleCheckBoxKeys {
        status: any;
        roles: any;
    }
}
```

### ⚙️ Props & Events

| Property           | Type                         | Default        | Description                  |
| :----------------- | :--------------------------- | :------------- | :--------------------------- |
| `checkBoxKey`      | `CheckBoxKey`                | `null`         | Key ส่งให้ Data Provider     |
| `id`               | `string`                     | `''`           | HTML id attribute            |
| `name`             | `string`                     | `''`           | HTML name attribute          |
| `value`            | `string[]`                   | `null`         | รายการ value ที่เลือก        |
| `customDataSource` | `any[]`                      | `undefined`    | Array ข้อมูลโดยตรง           |
| `disabled`         | `boolean`                    | `false`        | ปิดการใช้งานทุก Checkbox     |
| `layout`           | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction การแสดงผล          |
| `mode`             | `'multiple' \| 'single'`     | `'multiple'`   | เลือกได้หลายตัว หรือตัวเดียว |
| `displayExpr`      | `string`                     | `'text'`       | Field สำหรับ Label           |
| `valueExpr`        | `string`                     | `'value'`      | Field สำหรับ value           |
| `cascadeBy`        | `any`                        | `undefined`    | ค่า Parent สำหรับกรองข้อมูล  |
| `ignoreValue`      | `string[]`                   | `undefined`    | รายการ value ที่ซ่อน         |

| Event            | Payload               | Description                   |
| :--------------- | :-------------------- | :---------------------------- |
| `onValueChanged` | `{ value: string[] }` | เมื่อ Checkbox ถูกเปลี่ยนแปลง |

---

## 3. NumberBox (`<CnxNumberBox>`)

Component รับค่าตัวเลขที่ครอบทับ MUI `TextField` รองรับ Format, Min/Max, และประเภทตัวเลข

### ✨ คุณสมบัติเด่น

- **Format**: จัดรูปแบบตัวเลขด้วย `Intl.NumberFormat` เช่น `#,##0.00`
- **NumberType**: กำหนดช่วงค่าอัตโนมัติ (`positive`, `negative`, `percent`, `positivePercent`)
- **Arrow Buttons**: ปุ่มเพิ่ม/ลดค่า (ปิดได้ด้วย `disableArrow`)
- **AllowEmpty**: ค่าว่างแทน 0

### 🛠️ การนำไปใช้งาน

```tsx
import { CnxNumberBox } from '@cnx-dev/react-mui';

{
    /* พื้นฐาน */
}
<CnxNumberBox value={amount} onValueChanged={(e) => setAmount(e.value)} />;

{
    /* เฉพาะตัวเลขบวก */
}
<CnxNumberBox numberType="positive" value={qty} onValueChanged={(e) => setQty(e.value)} />;

{
    /* เปอร์เซ็นต์ 0-100 */
}
<CnxNumberBox numberType="positivePercent" format="#,##0.00" value={rate} onValueChanged={(e) => setRate(e.value)} />;

{
    /* ปิด Arrow */
}
<CnxNumberBox disableArrow value={score} onValueChanged={(e) => setScore(e.value)} />;
```

### ⚙️ Props & Events

| Property       | Type                                                                 | Default     | Description                         |
| :------------- | :------------------------------------------------------------------- | :---------- | :---------------------------------- |
| `id`           | `string`                                                             | `''`        | HTML id                             |
| `name`         | `string`                                                             | `''`        | HTML name                           |
| `value`        | `number \| null`                                                     | `null`      | ค่าตัวเลข                           |
| `disabled`     | `boolean`                                                            | `false`     | ปิดการใช้งาน                        |
| `format`       | `string`                                                             | `'#,##0'`   | รูปแบบ Format (เช่น `'#,##0.00'`)   |
| `numberType`   | `'positive' \| 'negative' \| 'percent' \| 'positivePercent' \| null` | `null`      | กำหนด Min/Max อัตโนมัติ             |
| `integer`      | `number`                                                             | `0`         | จำนวนหลักสูงสุด (ส่วนจำนวนเต็ม)     |
| `max`          | `number`                                                             | `undefined` | ค่าสูงสุด (override numberType)     |
| `min`          | `number`                                                             | `undefined` | ค่าต่ำสุด (override numberType)     |
| `allowEmpty`   | `boolean`                                                            | `false`     | อนุญาตให้ค่าเป็นว่าง (null)         |
| `tabIndex`     | `number`                                                             | `undefined` | Tab order                           |
| `disableArrow` | `boolean`                                                            | `false`     | ซ่อน Arrow Buttons + ป้องกัน ↑↓ key |
| `step`         | `number`                                                             | `1`         | ค่า increment/decrement ของ Arrow   |

| Event            | Payload                               | Description           |
| :--------------- | :------------------------------------ | :-------------------- |
| `onValueChanged` | `{ value, previousValue, fromInit? }` | เมื่อค่าตัวเลขเปลี่ยน |
| `onEnterKey`     | `void`                                | เมื่อกด Enter         |

---

## 4. DateBox (`<CnxDateBox>`)

Component รับวันที่ที่ครอบทับ MUI `DatePicker` พร้อม `date-fns` adapter รองรับ Disabled Dates และ Auto Default

### ✨ คุณสมบัติเด่น

- **ใช้ `date-fns`**: Adapter สำหรับ MUI X DatePicker
- **Output Format**: คืนค่าเป็น `string` รูปแบบ `yyyy-MM-dd` เหมือน `react-devextreme`
- **Disabled Dates**: กำหนดวันที่ไม่สามารถเลือกได้
- **AutoDefault**: กำหนดวันที่เริ่มต้นเป็นวันนี้อัตโนมัติ
- **AllowEmpty**: ป้องกัน null / คืนค่าเป็นวันนี้ถ้าล้างค่า

### 🛠️ การนำไปใช้งาน

```tsx
import { CnxDateBox } from '@cnx-dev/react-mui';

{
    /* พื้นฐาน */
}
<CnxDateBox value={date} onValueChanged={(e) => setDate(e.value)} />;

{
    /* กำหนด Min/Max */
}
<CnxDateBox value={date} minDate="2025-01-01" maxDate="2025-12-31" onValueChanged={(e) => setDate(e.value)} />;

{
    /* Disabled Dates (วันหยุด) */
}
<CnxDateBox value={date} disabledDates={['2025-04-13', '2025-04-14', '2025-04-15']} onValueChanged={(e) => setDate(e.value)} />;

{
    /* Auto Default วันนี้ */
}
<CnxDateBox autoDefault onValueChanged={(e) => setDate(e.value)} />;
```

### ⚙️ Props & Events

| Property        | Type                     | Default         | Description                               |
| :-------------- | :----------------------- | :-------------- | :---------------------------------------- |
| `id`            | `string`                 | `''`            | HTML id                                   |
| `name`          | `string`                 | `''`            | HTML name                                 |
| `value`         | `string \| Date \| null` | `undefined`     | ค่าวันที่ (`yyyy-MM-dd` string หรือ Date) |
| `disabled`      | `boolean`                | `false`         | ปิดการใช้งาน                              |
| `format`        | `string`                 | `'dd-MMM-yyyy'` | รูปแบบแสดงผล (date-fns format)            |
| `placeholder`   | `string`                 | `''`            | Placeholder text                          |
| `minDate`       | `Date \| string`         | `undefined`     | วันที่เริ่มต้นที่เลือกได้                 |
| `maxDate`       | `Date \| string`         | `undefined`     | วันที่สุดท้ายที่เลือกได้                  |
| `width`         | `number \| string`       | `180`           | ความกว้าง                                 |
| `disabledDates` | `string[] \| Date[]`     | `[]`            | รายการวันที่ disable                      |
| `allowEmpty`    | `boolean`                | `true`          | อนุญาตให้ value เป็น null                 |
| `autoDefault`   | `boolean`                | `false`         | ใส่วันนี้อัตโนมัติเมื่อ value ว่าง        |

| Event            | Payload                                     | Description        |
| :--------------- | :------------------------------------------ | :----------------- |
| `onValueChanged` | `{ value: string \| null, previousValue? }` | เมื่อวันที่เปลี่ยน |
| `onEnterKey`     | `void`                                      | เมื่อกด Enter      |

---

## 5. RadioGroup (`<CnxRadioGroup>`)

Component Radio Button Group ที่ครอบทับ MUI `RadioGroup` รองรับ Context-based Data Provider และ Auto Default

### ✨ คุณสมบัติเด่น

- **Auto Default**: เลือกตัวเลือกแรกอัตโนมัติ
- **Layout**: รองรับ `horizontal` และ `vertical`
- **Context Provider**: ดึงข้อมูลผ่าน `RadioGroupDataProviderContext`
- **IntelliSense Ready**: รองรับ `ModuleRadioGroupKeys`

### 🛠️ การนำไปใช้งาน

#### 1. สร้าง Data Provider Service

```typescript
import type { RadioGroupDataProvider, RadioGroupViewModel } from '@cnx-dev/react-mui';

export const appRadioGroupService: RadioGroupDataProvider = {
    getService: async (key, param): Promise<RadioGroupViewModel[]> => {
        if (key === 'gender') {
            return [
                { value: 'M', text: 'ชาย' },
                { value: 'F', text: 'หญิง' },
            ];
        }
        return [];
    },
};
```

#### 2. ใช้งานใน Component

```tsx
import { CnxRadioGroup } from '@cnx-dev/react-mui';

{
    /* ผ่าน Context */
}
<CnxRadioGroup radioGroupKey="gender" value={gender} layout="horizontal" onValueChanged={(e) => setGender(e.value)} />;

{
    /* Custom DataSource */
}
<CnxRadioGroup
    customDataSource={[
        { value: 'yes', text: 'ใช่' },
        { value: 'no', text: 'ไม่ใช่' },
    ]}
    value={answer}
    autoDefault={false}
    onValueChanged={(e) => setAnswer(e.value)}
/>;
```

#### 3. TypeScript Auto-Complete

```typescript
declare module '@cnx-dev/react-mui' {
    export interface ModuleRadioGroupKeys {
        gender: any;
        approvalStatus: any;
    }
}
```

### ⚙️ Props & Events

| Property           | Type                         | Default        | Description                 |
| :----------------- | :--------------------------- | :------------- | :-------------------------- |
| `radioGroupKey`    | `RadioGroupKey`              | `null`         | Key ส่งให้ Data Provider    |
| `id`               | `string`                     | `''`           | HTML id                     |
| `name`             | `string`                     | `''`           | HTML name                   |
| `value`            | `string \| null`             | `undefined`    | ค่าที่เลือก                 |
| `customDataSource` | `any[]`                      | `undefined`    | Array ข้อมูลโดยตรง          |
| `disabled`         | `boolean`                    | `false`        | ปิดการใช้งาน                |
| `layout`           | `'horizontal' \| 'vertical'` | `'horizontal'` | Direction การแสดงผล         |
| `autoDefault`      | `boolean`                    | `true`         | เลือกตัวเลือกแรกอัตโนมัติ   |
| `displayExpr`      | `string`                     | `'text'`       | Field สำหรับ Label          |
| `valueExpr`        | `string`                     | `'value'`      | Field สำหรับ value          |
| `cascadeBy`        | `any`                        | `undefined`    | ค่า Parent สำหรับกรองข้อมูล |
| `ignoreValue`      | `string[]`                   | `undefined`    | รายการ value ที่ซ่อน        |

| Event            | Payload          | Description         |
| :--------------- | :--------------- | :------------------ |
| `onValueChanged` | `{ value: any }` | เมื่อ Radio เปลี่ยน |

---

## 🗺️ Migration จาก `react-devextreme`

| react-devextreme Import         | react-mui Import                |
| :------------------------------ | :------------------------------ |
| `@cnx-dev/react-devextreme`     | `@cnx-dev/react-mui`            |
| `SelectBoxDataProviderContext`  | `SelectBoxDataProviderContext`  |
| `CheckBoxDataProviderContext`   | `CheckBoxDataProviderContext`   |
| `RadioGroupDataProviderContext` | `RadioGroupDataProviderContext` |

**API ของ Props เหมือนกัน 100%** — สลับ import ได้ทันที
