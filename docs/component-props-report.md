# Component Props Report - Tamagotchain Frontend

## Common Components

### 1. PetDisplay Component
- **ไฟล์**: `src/components/PetDisplay.jsx`
- **Props**:
  ```javascript
  {
    status: string = 'IDLE',  // 'IDLE', 'WALK', 'EAT', 'SLEEP', 'TIRED', 'DEAD'
    size: number = 200        // ขนาดของภาพ (pixels)
  }
  ```
- **การใช้งาน**:
  - แสดงภาพสัตว์เลี้ยงตามสถานะ
  - มี animation ตามสถานะ
  - แสดง effect พิเศษ (🤒 เมื่อป่วย, 👻 เมื่อตาย)

### 2. PixelBar Component
- **ไฟล์**: `src/components/common/PixelBar.jsx`
- **Props**:
  ```javascript
  {
    label: string,     // ชื่อแถบ เช่น "Hunger", "Energy"
    value: number,     // ค่าปัจจุบัน
    max: number,       // ค่าสูงสุด
    color: string      // CSS class สำหรับสี เช่น "bg-yellow-400"
  }
  ```
- **การใช้งาน**:
  - แสดงแถบสถิติแบบ pixel art
  - คำนวณ percentage อัตโนมัติ
  - แสดงค่าเป็น %

### 3. SideButton Component
- **ไฟล์**: `src/components/common/SideButton.jsx`
- **Props**:
  ```javascript
  {
    emoji: string,        // อีโมจิที่แสดงบนปุ่ม
    label: string,        // ข้อความใต้ปุ่ม
    onClick: function,    // function ที่เรียกเมื่อกดปุ่ม
    disabled: boolean,    // สถานะปิด/เปิดปุ่ม
    color?: string        // สีพื้นหลัง (optional)
  }
  ```
- **การใช้งาน**:
  - ปุ่มสำหรับการดำเนินการกับสัตว์เลี้ยง
  - แสดงจำนวน stock ในหน้า MyPet
  - มี hover effects

### 4. Button Component
- **ไฟล์**: `src/components/common/Button.jsx`
- **Props**:
  ```javascript
  {
    children: ReactNode,           // เนื้อหาในปุ่ม
    onClick: function,             // function ที่เรียกเมื่อกดปุ่ม
    variant: string = 'primary',   // 'primary', 'secondary', 'danger', 'success'
    disabled: boolean = false,     // สถานะปิด/เปิดปุ่ม
    isLoading: boolean = false,    // แสดง loading spinner
    className: string = ''         // CSS classes เพิ่มเติม
  }
  ```
- **การใช้งาน**:
  - ปุ่มทั่วไปในระบบ
  - มี variant หลายแบบ
  - รองรับ loading state

## Layout Components

### 5. MainLayout Component
- **ไฟล์**: `src/components/layout/MainLayout.jsx`
- **Props**:
  ```javascript
  {
    children: ReactNode    // เนื้อหาที่จะแสดงใน main area
  }
  ```
- **การใช้งาน**:
  - Layout หลักที่ครอบทุกหน้า
  - ประกอบด้วย Sidebar + Main Content

### 6. Sidebar Component
- **ไฟล์**: `src/components/common/Sidebar.jsx`
- **Props**: ไม่มี props (ใช้ internal state)
- **Internal State**:
  ```javascript
  {
    isOpen: boolean    // สถานะเปิด/ปิด sidebar ในมือถือ
  }
  ```
- **การใช้งาน**:
  - เมนูนำทางหลัก
  - Responsive design
  - แสดงสถานะ wallet

## Page-Specific Components

### 7. Modal Components (ใน MyPet)
- **Confirmation Modal**:
  ```javascript
  {
    confirmData: {
      mode: string,      // 'REFILL_FOOD', 'REFILL_STOCK', 'SKIP_CD'
      type: string,      // 'play', 'rest', 'Feed'
      cost: number,      // ราคา ETH
      msg: string        // ข้อความแสดง
    }
  }
  ```

### 8. Toast Notification (ใน MyPet)
- **Notification State**:
  ```javascript
  {
    notification: {
      msg: string,       // ข้อความที่แสดง
      type: string       // 'success', 'error'
    }
  }
  ```

## Props Patterns ที่ใช้

### Event Handler Pattern
```javascript
// ส่ง function เป็น prop
<SideButton onClick={handleFeedClick} />
<Button onClick={() => navigate('/battle')} />
```

### Conditional Props Pattern
```javascript
// ส่ง props ตามเงื่อนไข
<SideButton 
  disabled={petStatus === 'DEAD'} 
  color={getStockColor(foodStock.count, MAX_FOOD)}
/>
```

### State-Driven Props Pattern
```javascript
// ส่ง state เป็น props
<PetDisplay status={petStatus} size={200} />
<PixelBar value={hunger} max={100} color="bg-yellow-400" />
```