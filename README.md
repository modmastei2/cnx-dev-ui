# @cnx-dev UI Components Library

คลังรวบรวม UI Components สำหรับการพัฒนา Web Application ภายในองค์กร ที่ถูกต่อยอดและปรับแต่งมาจาก DevExtreme เพื่อให้ได้มาตรฐานเดียวกัน ใช้งานง่าย และรองรับ Dependency Injection อย่างสมบูรณ์

## 📚 สารบัญ Component (Table of Contents)

### Angular DevExtreme (`@cnx-dev/angular-devextreme`)

- [Select Box (Dropdown)](docs/select-box.md) - Dropdown สมาร์ทที่รองรับการโหลดข้อมูลแบบ Dynamic, Cascade, และ Pagination

### 🛠️ คู่มือสำหรับนักพัฒนา (Developer Guides)

- [How to Publish Library](docs/publishing.md) - ขั้นตอนการ Build และ Publish แพ็กเกจขึ้น NPM Registry

---

## 🚀 การติดตั้งเบื้องต้น (Getting Started)

### 1. ติดตั้ง Package

```bash
npm install @cnx-dev/angular-devextreme
```

### 2. ตั้งค่า DevExtreme Stylesheet

เปิดไฟล์ `angular.json` และเพิ่ม CSS ของ DevExtreme (แนะนำให้ใช้ theme `compact`):

```json
"styles": [
  "node_modules/devextreme/dist/css/dx.light.compact.css",
  "src/styles.css"
]
```

### 3. ตั้งค่า Viewport

เปิดไฟล์ `src/index.html` และเพิ่ม class `dx-viewport` ที่ tag `<body>`:

```html
<body class="dx-viewport">
  <app-root></app-root>
</body>
```
