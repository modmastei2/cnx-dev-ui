# 🛠️ คู่มือแก้ปัญหา (Troubleshooting Guide)

เอกสารนี้รวบรวม **ปัญหาที่พบบ่อย (Common Issues)** และ **วิธีแก้ไข (Solutions)** ที่มักจะเกิดขึ้นระหว่างการพัฒนา คอนฟิกูเรชันตอนบิลด์ หรือการนำ Library ไปใช้งานร่วมกับโปรเจกต์อื่น เพื่อช่วยให้ทีมประหยัดเวลาในการหาบั๊ก

> 💡 **ต้องการเพิ่มปัญหาใหม่ลงในเอกสารนี้?**
>
> _ให้คัดลอก [เทมเพลตสำหรับเพิ่ม Error ใหม่](#เทมเพลตสำหรับเพิ่ม-error-ใหม่-template) ด้านล่างสุดของไฟล์ แล้วนำปัญหาไปแปะต่อเติมในหมวดหมู่ที่เกี่ยวข้องด้านบนได้เลยครับ_

---

## 📑 สารบัญรวมปัญหา (Table of Contents)

### NPM & Publishing Issues

- [NPM-001: 403 Forbidden - You cannot publish over the previously published versions](#npm-001-403-forbidden---you-cannot-publish-over-the-previously-published-versions)

---

### Angular Library & Workspace Issues

- [CLI-001: TS-993004 Unable to import pipe DatePipe (ตอนทำ Live-Reload)](#cli-001-ts-993004-unable-to-import-pipe-datepipe-ตอนทำ-live-reload)
- [RT-001: Cannot read properties of null (reading 'bindingStartIndex')](#rt-001-cannot-read-properties-of-null-reading-bindingstartindex)

---

## 🛑 หมวดหมู่: Angular Library & Workspace Issues

### CLI-001: TS-993004 Unable to import pipe DatePipe (ตอนทำ Live-Reload)

**อาการ (Symptoms):**
เมื่อใช้งานโหมดทดสอบ Live-Reload แบบ Map Path ใน `tsconfig.json` แล้ว Compiler แจ้งว่า:
`The symbol is not exported from node_modules/@angular/common/types/common.d.ts (module '@angular/common')`

**สาเหตุ (Root Cause):**
ตัวแอปหลักกับตัว Library ไป Resolve ค่า `@angular/common` แยกกันคนละแห่ง ทำให้ TypeScript รวบ Type ไม่ถูก (เกิด Dual Interfaces)

**วิธีแก้ (Solution):**
บังคับให้ทุกอย่างของ Angular ชี้กลับไปที่ `node_modules` ของแอปหลักเสมอ โดยใส่ค่าเพิ่มเข้าไปใน `compilerOptions.paths` ดังนี้

```json
// ใน tsconfig.json ของแอปหลัก
"paths": {
  "@angular/*": ["./node_modules/@angular/*"]
}
```

<hr>

### RT-001: Cannot read properties of null (reading 'bindingStartIndex')

**อาการ (Symptoms):**
หน้าเว็บขาว มี Error ใน Console ชี้ไปหา ɵɵelementStart หรือ ɵɵelement ในเทมเพลตปกติ

**สาเหตุ (Root Cause):**
โปรเจกต์คุณกำลังโหลด Angular Framework เข้ามามากกว่า 1 ชุด (Multiple Angular Instances) ทำให้ Engine ในการเรนเดอร์ UI ทำงานตีกัน ส่วนใหญ่เกิดจากการ Map Path โดยไม่ตั้งค่า Bundler ให้รักษา Context ของ Symlink ให้ถูกต้อง

**วิธีแก้ (Solution):**
กำหนดให้ฝั่ง Build Tool มองข้าม Module ต้นทางแล้วยึด Component ปลายทางแบบ `preserveSymlinks`

1. **ใน `angular.json`**:
   เพิ่มใน Architect > Build > Options
    ```json
    "preserveSymlinks": true
    ```
2. **ใน `tsconfig.json`**:
   เพิ่ม property ใน root ของ compilerOptions และดัก dependency นอกให้หมด:
    ```json
    "preserveSymlinks": true,
    "paths": {
       "rxjs": ["./node_modules/rxjs"],
       "devextreme": ["./node_modules/devextreme"],
       "devextreme-angular": ["./node_modules/devextreme-angular"]
    }
    ```
    _หมายเหตุ: บางกรณี (เช่น Angular V17 Application Builder ใหม่) ถ้าวิธีนี้ไม่ได้ผล อาจจะต้องเลิกทำ Path mapping แล้ว Build Library ผ่าน npm script ให้เสร็จก่อนใช้งานจริง_

---

## 🛑 หมวดหมู่: NPM & Publishing Issues

### NPM-001: 403 Forbidden - You cannot publish over the previously published versions

**อาการ (Symptoms):**
เมื่อพยายามรันคำสั่ง `npm publish` (หรือทำงานผ่าน GitHub Actions) จะพบ Error พ่นออกมาประมาณนี้:

```
npm error 403 403 Forbidden - PUT https://registry.npmjs.org/... - You cannot publish over the previously published versions: x.x.x.
```

**สาเหตุ (Root Cause):**
NPM มีกฎหมายเหล็กเรื่อง **Immutability** คือเลขเวอร์ชันใดๆ ที่เคยถูก Publish ขึ้นไปแล้ว แม้จะถูกลบทิ้ง (Unpublish) ออกจากหน้าเว็บไปแล้วก็ตาม จะ**ไม่สามารถนำเลขนั้นกลับมา Publish ทับได้อีกตลอดกาล** เพื่อป้องกัน Supply Chain Attack และรักษาโค้ดให้สม่ำเสมอ

**วิธีแก้ (Solution):**

1. เปิดไฟล์ `package.json` ของ Library (เช่น `packages/angular-devextreme/package.json`)
2. ทำการอัปเดตเวอร์ชัน (Version Bump) ให้เป็นเลขใหม่ที่ไม่เคยใช้มาก่อน เช่น จาก `"1.0.0"` เป็น `"1.0.1"`
3. กด Commit โค้ดที่แก้
4. สร้าง Git Tag ตัวใหม่ (เช่น `v1.0.1`) แทนที่อันเก่า แล้ว Push ขึ้น Git ใหม่
5. ปล่อยให้ Action ทำงาน หรือรันคำสั่งขยับเวอร์ชันใหม่ขึ้น NPM ได้เลย

---

## 📝 เทมเพลตสำหรับเพิ่ม Error ใหม่ (Template)

_(Copy โครงสร้างด้านล่างนี้เพื่อใช้เขียนเรื่องใหม่)_

````markdown
### รหัส/ชื่อปัญหา: ความสั้นๆที่เข้าใจง่าย

**อาการ (Symptoms):**
(อธิบายอาการที่เจอ ข้อความ Error ที่แสดงบนหน้าจอ หรือใน Console)

**สาเหตุ (Root Cause):**
(อธิบายเหตุผลทางเทคนิคว่าทำไมมันถึงพัง)

**วิธีแก้ (Solution):**
(วิธีแก้ 1-2-3 หรือโค้ดตัวอย่างเพื่อให้ผ่านปัญหานี้ไปได้)
\```typescript
// โค้ดตัวอย่างถ้ามี
\```

<hr>
````
