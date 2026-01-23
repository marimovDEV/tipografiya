# PrintERP - User Guide & Capabilities

## 🎯 Proyekt Nima?

**PrintERP** - To'liq professional ERP system chop etish kompaniyasi uchun. Bu sistem sizga:
- Buyurtmalarni boshqarish
- Ishlab chiqarishni kuzatish
- Moliyaviy hisobotlar
- Ishchilarni boshqarish
- Avtomatik ogohlantirish

---

## 💡 Proyekt Nimalarni Qila Oladi?

### 1️⃣ BUYURTMA BOSHQARUVI
✅ **Yangi buyurtma yaratish**
- Mijoz ma'lumotlari
- Quti turi va o'lchamlari
- Qog'oz turi, zichligi
- Chop etish ranglari (4+0, 4+4, 5+5)
- Lak turi
- Miqdor va muddati

✅ **Smart narxlash**
- 4 ta stsenariy:
  - Standard (1.0x) - 5-7 kun
  - Express (1.5x) - 2-3 kun - 50% QIMMAT
  - Night (1.3x) - 3-4 kun - 30% qo'shimcha
  - Economy (0.9x) - 10+ kun - 10% ARZON

✅ **Narxni bloklash**
- Tasdiqlangandan keyin narx o'zgarmaydi
- Manual o'zgartirish faqat admin
- To'liq audit trail (kim, qachon, nima uchun)

✅ **Buyurtma holati**
- Kutilmoqda → Tasdiqlandi → Ishlab chiqarishda → Tayyor → Yetkazildi

---

### 2️⃣ ISHLAB CHIQARISH OPTIMIZATSIYASI

✅ **Bottleneck Detection (Muammolarni topish)**
```
Misol:
Printing bosqichida navbat: 8 ta buyurtma
O'rtacha kutish: 14.5 soat
Ishchilar: 1 kishi
⚠️ TAVSIYA: Qo'shimcha ishchi biriktiring!
```

✅ **Parallel Flow (Parallel ishlash)**
```
Oddiy ravishda: 15 soat
Parallel bilan: 11 soat
⚡ TEJALADI: 4 soat (27%!)
```

✅ **Smart Worker Assignment**
- Eng yaxshi ishchini avtomatik tanlaydi
- Samaradorlik asosida (units/h)
- Xato darajasi (error rate <5%)
- Hozirgi ish yuki

✅ **Machine Downtime Tracking**
- Mashina qachon ishlamayapti?
- Sababi: texnik xizmat, buzilish, ta'mirlash
- Availability %: 95%+ target
- Ogohlantirish: >4 soat to'xtaganda

---

### 3️⃣ MOLIYAVIY MODUL

✅ **Double-Entry Accounting (Ikki tomonlama buxgalteriya)**
```
Sotuv:
Debet: Debitorlar 500,000
Kredit: Daromad    500,000
✅ Balanced!
```

✅ **Trial Balance (Sinov balansi)**
- Barcha hisoblar
- Debet va kredit
- Balanslanganligini tekshirish

✅ **Balance Sheet (Balans)**
- Aktivlar = Passivlar + Kapital
- Bank uchun tayyor hisobot

✅ **KPI Dashboard**
- **Gross Margin:** 40% (Target: 35%+)
- **Cash Flow:** +10M UZS (net)
- **Daromad:** 25M UZS (30 kun)
- **Foyda:** 10M UZS

✅ **ROI Tracking**
```
Ishchi ROI:
Ali: 178% - ⭐ EXCELLENT
Vali: 95% - ⚠️ Needs improvement

Mashina ROI:
Heidelberg: 131% - ✅ PROFITABLE
```

---

### 4️⃣ SMART AUTOMATION

✅ **Telegram Notifications (6 turi)**

1. **Order Status:**
```
🔔 Buyurtma holati o'zgardi!
📦 Buyurtma: #123
✅ Yangi holat: Tayyor
```

2. **Deadline Alerts:**
```
🔴 JUDA TEZKOR!
📦 Buyurtma: #145
⏰ Qoldi: 1 kun
```

3. **Bottleneck Warnings:**
```
🔴 BOTTLENECK ANIQLANDI!
🏭 Bosqich: printing
📊 Navbat: 8 buyurtma
💡 Tavsiya: Qo'shimcha ishchi
```

4. **Low Stock:**
```
⚠️ KAM QOLDI!
📦 Material: Karton A4
📊 Zaxira: 50 kg
⚡ Minimal: 100 kg
```

5. **Machine Downtime:**
```
🔴 MASHINA TO'XTADI!
🏭 Mashina: Heidelberg
⚠️ Sabab: Buzilish
⏱️ Vaqt: 4 soat
```

6. **Employee Achievement:**
```
🏆 YUQORI SAMARADORLIK!
👤 Ali
95% samaradorlik bu hafta!
Davom eting! 💪
```

✅ **Auto-Workflows (Avtomatik amallar)**
- Order tasdiqlanganda → Materials avtomatik rezerv
- Order tugaganda → Accounting entry avtomatik yaratiladi
- Step boshlanganida → Worker avtomatik biriktiriladi

---

### 5️⃣ MULTI-MODE UI (4 xil interfeys)

#### 👑 ADMIN MODE
```
Theme: Dark
Features: HAMMASI
Dashboard: To'liq (Financial, Production, Analytics)
Layout: Full sidebar
```

#### 📊 MANAGER MODE
```
Theme: Light
Features: Production, Orders, Reports
Dashboard: Production-focused
Layout: Top navigation
```

#### 👷 WORKER MODE
```
Theme: High-contrast
Features: Mening vazifalarim
Dashboard: Simple task list
Layout: Touch-optimized (80px buttons)
Special: LARGE BUTTONS!
```

#### 🧑‍💼 CLIENT MODE
```
Theme: Minimal
Features: Buyurtmalarim, Tracking
Dashboard: Order status
Layout: Clean navigation
```

---

## 🚀 QANDAY ISHLATISH?

### 1. Kirish (Login)

```
URL: http://localhost:3000
Email: admin@example.com
Password: <sizning parolingiz>
```

### 2. Yangi Buyurtma Yaratish

**Yo'l:**
1. Orders → New Order
2. Mijoz tanlash (yoki yangi)
3. Mahsulot ma'lumotlari:
   - Box type: Flip-top
   - Dimensions: 10x20x5 sm
   - Qog'oz: Kraft 300g/m²
   - Rang: 4+4
   - Lak: Matt
   - Miqdor: 1000
4. **Stsenariy tanlash:**
   - ✅ Standard: 100,000 UZS (5-7 kun)
   - Express: 150,000 UZS (2-3 kun)
5. Save → Calculate
6. Approve

**Natija:**
- Order yaratildi
- Materials avtomatik rezerv
- Worker avtomatik biriktirildi
- Telegram notification yuborildi

---

### 3. Production Monitoring

**Dashboard:**
```
Capacity: 65% ⚠️
Active Orders: 12
Queue Days: 2

Bottlenecks:
├─ Printing: 8 orders (CRITICAL)
└─ Cutting: OK
```

**Action:**
- Bottleneck detected → Telegram alert sent
- Recommendation: "Add worker to printing"
- Manager assigns extra worker
- Problem solved! ✅

---

### 4. Financial Reports

**Monthly Dashboard:**
```
📊 Gross Margin: 40.0% ✅
💰 Revenue: 25,000,000 UZS
💵 Cash Flow: +10,000,000 UZS
📈 Profit: 10,000,000 UZS

Top Orders:
#145: +1,300,000 (52% margin!) ⭐
#123: +800,000
#156: +650,000
```

**KPI Analysis:**
```
✅ Gross margin >35%: EXCELLENT
✅ Cash flow positive: HEALTHY
✅ Machine uptime 97%: EXCELLENT
⚠️ Printing bottleneck: ACTION NEEDED
```

---

### 5. Worker Interface (Touch)

**Worker Dashboard:**
```
┌────────────────────────────────┐
│  MENING VAZIFALARIM (2)        │
├────────────────────────────────┤
│                                │
│  [◉] PRINTING                  │
│      #145 - Flip-top           │
│      [▶ BOSHLASH]              │ ← 80px button
│                                │
├────────────────────────────────┤
│                                │
│  [ ] CUTTING                   │
│      #146 - Kraft              │
│      (NAVBATDA)                │
│                                │
└────────────────────────────────┘
```

**Swipe Actions:**
- ▶ Swipe right: Start task
- ✓ Swipe left: Complete
- 🔄 Long press: Reassign

---

## 📊 REAL-WORLD EXAMPLES

### Example 1: VIP Mijoz Express Order

```
Input:
- Client: VIP Corp
- Box: Premium Flip-top
- Quantity: 500
- Deadline: 2 kun
- Scenario: EXPRESS

Result:
Base: 800,000 UZS
Express (1.5x): 1,200,000 UZS
Deadline: 01/03/2026 (2 kun) ✅

Actions:
✅ Materials reserved (FIFO)
✅ Top worker assigned (Ali - 95% efficiency)
✅ Night shift scheduled
✅ Client notified (Telegram)
```

### Example 2: Bottleneck Detected

```
Situation:
Printing stage: 8 orders waiting
Average wait: 14.5 hours
Workers: 1 person
Severity: 75% (HIGH)

Auto-Actions:
1. Telegram → Manager: "Bottleneck at printing!"
2. Recommendation: "Add 1 worker"
3. Smart Assignment: Ali assigned to printing
4. Queue reduced: 8 → 4
5. Wait time: 14.5h → 7h
✅ PROBLEM SOLVED
```

### Example 3: Financial Month-End

```
Manager: "Qancha foyda qildik?"

System Response:
┌─────────────────────────────┐
│ FINANCIAL SUMMARY           │
├─────────────────────────────┤
│ Revenue:    25,000,000 UZS  │
│ Cost:       15,000,000 UZS  │
│ Profit:     10,000,000 UZS  │
│ Margin:     40.0% ✅        │
└─────────────────────────────┘

Gross Margin: EXCELLENT (>35%)
Cash Flow: +10M (POSITIVE) ✅
ROI: All machines profitable ✅

Next Steps:
→ Download balance sheet (PDF)
→ Bank loan application ready
→ Investor report ready
```

---

## 🎓 KEY CAPABILITIES SUMMARY

### ✅ BUYURTMA
- Smart pricing (4 scenarios)
- Price locking
- Auto-calculate
- Deadline tracking
- Telegram notifications

### ✅ PRODUCTION
- Bottleneck detection (real-time)
- Parallel flow (27% faster)
- Smart worker assignment
- Machine monitoring (95%+ uptime)

### ✅ FINANCIAL
- Double-entry accounting
- Trial balance & Balance sheet
- KPI dashboard (40% margin)
- ROI tracking (150%+ target)

### ✅ AUTOMATION
- 6 Telegram alerts
- 4 Auto-workflows
- Periodic checks
- Smart triggers

### ✅ UI/UX
- 4 mode interfaces
- Touch-optimized workers
- Real-time updates
- Mobile-friendly

---

## 🚀 QUICK START (Hozir!)

Sistema allaqachon ishlamoqda:
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3000

**Keyingi qadam:**
1. Browser ochish
2. Login qilish
3. Demo buyurtma yaratish
4. Dashboard ko'rish

**Ready! Ochaylikmi? 🎉**
