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

คุณสามารถสั่ง Build อย่างเดียวได้ (เพื่อให้ได้ไฟล์ `.tgz` ล่าสุด ก่อนแจกจ่าย) ด้วยคำสั่ง:

```bash
npm run build:lib
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

### 4. Publish ขึ้นระบบ (แบบรวบยอด)

รันคำสั่งเดียวที่จบกระบวนการ (มันจะสั่ง `build:lib` ให้ก่อน แล้วเข้าไปในแฟ้ม `dist/...` เพื่อ Publish ให้อัตโนมัติ)

```bash
npm run publish:lib
```

> ⚠️ **ข้อควรระวัง (403 Forbidden)**
> หากพบ Error 403 และแจ้งเตือนเกี่ยวกับ **2FA (Two-factor authentication)**
> ให้คุณหยิบมือถือมาเปิดแอป Authenticator แล้วนำรหัส 6 หลัก มาใส่ต่อท้ายคำสั่ง Publish:
>
> ```bash
> cd dist/packages/angular-devextreme
> npm publish --access public --otp=123456
> ```
>
> **ทางเลือก: การใช้ NPM Token (สำหรับ CI/CD หรือ Automation)**
> นอกจากการใช้ OTP แล้ว คุณสามารถตั้งค่า Automation Token เพื่อข้ามการขอ OTP ได้ โดยสร้างไฟล์ `.npmrc` (หรือรันคำสั่ง) แล้วใส่ Token ที่สร้างจากหน้าเว็บ NPM ดังนี้:
>
> ```ini
> //registry.npmjs.org/:_authToken=${NPM_TOKEN}
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
