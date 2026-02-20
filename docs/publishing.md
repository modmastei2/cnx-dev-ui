# 📦 การ Publish Library (NPM)

บทความนี้อธิบายขั้นตอนการ Build และ Publish UI Component Library (`@cnx-dev/angular-devextreme`) ขึ้นสู่ระบบ NPM Registry

---

## 🚀 ขั้นตอนการ Publish (Step-by-Step)

### 1. อัปเดตเวอร์ชัน

ก่อนการ Publish ทุกครั้ง **ต้องเปลี่ยนเลขเวอร์ชัน** ในไฟล์ `packages/angular-devextreme/package.json` เสมอ (ห้ามใช้เลขซ้ำกับบนระบบ NPM)

ตัวอย่าง `package.json`:

```json
{
  "name": "@cnx-dev/angular-devextreme",
  "version": "1.0.3", // <-- เปลี่ยนเลขตรงนี้
  "description": "CNX Dev - Angular DevExtreme UI Component Library"
  // ...
}
```

> **กฎการตั้งชื่อ Version (Semantic Versioning)**
>
> - `x.0.0` (Major) - มีการเปลี่ยนแปลงใหญ่ที่กระทบระบบเดิม (Breaking Changes)
> - `0.x.0` (Minor) - เพิ่ม Feature ใหม่ ทำงานร่วมกับของเดิมได้ (Backward Compatible)
> - `0.0.x` (Patch) - แก้บั๊ก (Bug Fixes) หรือปรับปรุงเล็กน้อย

### 2. Build Library (APF)

รันคำสั่ง Build ผ่าน Nx เพื่อให้ระบบ Compile โค้ดของ Library ให้อยู่ในรูปแบบ **Angular Package Format (APF)** ซึ่งจะได้ไฟล์สำหรับแจกจ่ายในโฟลเดอร์ `dist/packages/angular-devextreme`

รันคำสั่งที่ Root ของโปรเจกต์ (`cnx-dev-ui`):

```bash
npx nx build angular-devextreme
```

### 3. Login เข้าสู่ระบบ NPM

หากเป็นการ Publish ครั้งแรกบนเครื่อง หรือเพิ่งเปลี่ยน Registry จำเป็นต้องยืนยันตัวตนก่อน

**กรณี Public NPM:**

```bash
npm login
```

**กรณี Private NPM (ของบริษัท):**

```bash
npm login --registry=https://npm.your-company.com
```

### 4. Publish ขึ้นระบบ

ย้ายเข้าไปโฟลเดอร์ที่ Build เสร็จแล้ว และรันคำสั่ง Publish

```bash
# 1. เข้าไปที่โฟลเดอร์ Dist
cd dist/packages/angular-devextreme

# 2. รันคำสั่ง Publish
npm publish --access public
```

> ⚠️ **ข้อควรระวัง (403 Forbidden)**
> หากพบ Error 403 และแจ้งเตือนเกี่ยวกับ **2FA (Two-factor authentication)**
> ให้คุณหยิบมือถือมาเปิดแอป Authenticator แล้วนำรหัส 6 หลัก มาใส่ต่อท้ายคำสั่ง Publish:
>
> ```bash
> npm publish --access public --otp=123456
> ```

---

## 🛠️ โครงสร้างสำคัญที่ต้องมีก่อน Publish

ในไฟล์ `packages/angular-devextreme/tsconfig.lib.json` ต้องกำหนดให้อยู่ในโหมด **Partial Compilation** ทิ้งไว้เสมอ:

```json
"angularCompilerOptions": {
  "compilationMode": "partial"
}
```

_(ถ้าเผลอแก้เป็น Full Compilation ระบบ NPM จะ Reject การอัปโหลดทันที เพราะ Angular แนะนำให้แจกจ่าย Library เป็นแบบ Partial เท่านั้น)_
