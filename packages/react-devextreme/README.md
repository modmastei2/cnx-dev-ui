# @cnx-dev/react-devextreme UI Components Library

คลังรวบรวม UI Components สำหรับการพัฒนา Web Application ด้วย React ภายในองค์กร ที่ถูกต่อยอดและปรับแต่งมาจาก DevExtreme เพื่อให้ได้มาตรฐานเดียวกัน ใช้งานง่าย และรองรับระบบ Dependency Injection ย่อยผ่านทาง React Context Provider

## 📚 สารบัญ Component (Table of Contents)

### React DevExtreme (`@cnx-dev/react-devextreme`)

- [Select Box (Dropdown)](src/lib/components/cnx-select-box/cnx-select-box.md) - Dropdown สมาร์ทที่รองรับการโหลดข้อมูลแบบ Dynamic, Cascade, และ Pagination
- [Tag Box (Multiple Selection)](src/lib/components/cnx-tag-box/cnx-tag-box.md) - Dropdown เลือกได้หลายรายการแบบ Dynamic (การป้อนข้อมูลอิงโครงสร้างเดียวกับ Select Box)
- [Date Box (DatePicker)](src/lib/components/cnx-date-box/cnx-date-box.md) - ช่องเลือกวันที่ ที่สามารถตั้งคาวันหยุด/Highlight บนปฏิทิน และจำกัดขอบเขตการเลือก (min/max) ได้
- [Number Box (NumberInput)](src/lib/components/cnx-number-box/cnx-number-box.md) - ช่องกรอกตัวเลขครอบจักรวาล ที่คุมหลักทศนิยม คุมเป็นค่าบวก/เปอร์เซ็นต์ ได้โดยอัตโนมัติ
- [Check Box Group](src/lib/components/cnx-check-box-group/cnx-check-box-group.md) - กลุ่ม CheckBox ที่จัดการ State ได้ในตัว โหลดข้อมูล Dynamic ผ่าน Context แบบ Single/Multiple
- [Radio Group](src/lib/components/cnx-radio-group/cnx-radio-group.md) - ตัวเลือกปุ่มวิทยุ (Radio) ที่รองรับข้อมูลจาก Context และมีระบบ Auto Defaults

### 🛠️ คู่มือสำหรับนักพัฒนา (Developer Guides)

- [How to Publish Library](../../docs/publishing.md) - ขั้นตอนการ Build และ Publish แพ็กเกจขึ้น NPM Registry แบบภาพรวมของ Nx Workspace
- [Troubleshooting Guide](../../docs/troubleshooting.md) - รวมปัญหาที่พบบ่อย (Errors) และวิธีแก้ไข (สามารถดูอ้างอิงของ Angular library ได้เช่นกัน)

---

## 🚀 การติดตั้งเบื้องต้น (Getting Started)

### 1. ติดตั้ง Package

```bash
npm install @cnx-dev/react-devextreme
```

### 2. ตั้งค่า DevExtreme Stylesheet

คุณสามารถนำเข้า CSS ของ DevExtreme ที่ระดับ Root ของโปรเจกต์ React (เช่นไฟล์ `main.tsx` หรือ `index.tsx`):

```tsx
import 'devextreme/dist/css/dx.light.compact.css'; // แนะนำใช้ Light Compact Theme
```

### 3. ตั้งค่า Viewport

เปิดไฟล์ `index.html` ของโปรเจกต์คุณ และเพิ่ม class `dx-viewport` เข้าไปที่ tag `<body>`:

```html
<body class="dx-viewport">
    <div id="root"></div>
</body>
```
