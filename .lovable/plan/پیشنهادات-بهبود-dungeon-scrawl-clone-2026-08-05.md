# پیشنهادات بهبود Dungeon Scrawl Clone

## خلاصه
پروژه فعلی یک کلون کامل Dungeon Scrawl با ویرایشگر canvas، لایه‌ها، خروجی SVG/PDF، هوش مصنوعی، سیستم چندطبقه، Fog of War، پنل Admin/CMS، و کتابخانه پراپ است. چند مسیر بهبود قابل پیشنهاد است که در ۴ دسته زیر تقسیم شده‌اند:

```text
┌────────────────────────────────────────────────────────────┐
│  1. Performance & Stability (پایداری و عملکرد)              │
│  2. UX & Polish (تجربه کاربری و ظرافت)                      │
│  3. Creative & Map Power (قدرت نقشه‌کشی)                    │
│  4. Business & Collaboration (کسب‌وکار و اشتراک‌گذاری)      │
└────────────────────────────────────────────────────────────┘
```

## ۱. Performance & Stability

| پیشنهاد | توضیح | تلاش |
|---------|--------|------|
| **Virtualize بزرگ نقشه‌ها** | فقط ناحیه دیدنی canvas رندر شود؛ نقشه‌های ۲۰۰×۲۰۰ سلول بدون افت FPS | متوسط |
| **Worker برای raycasting LOS** | محاسبات Line-of-Sight و Fog of War به web worker منتقل شود | متوسط |
| **Incremental save** | ذخیره فقط تغییرات (delta) به جای کل نقشه، کاهش bandwidth و خطای save | کم |
| **Debounced history** | کمبود فریم هنگام undo/redo سریع با debounce روی snapshots | کم |
| **Error boundary** | کپسوله‌کردن خطاهای canvas/AI تا کل اپ کرش نخورد | کم |
| **Production build test** | تست روی Cloudflare Worker Runtime برای شناسایی مشکلات Node-only | کم |

## ۲. UX & Polish

| پیشنهاد | توضیح | تلاش |
|---------|--------|------|
| **Auto-save indicator** | نشانگر real-time وضعیت ذخیره با آخرین زمان موفق | کم |
| **Dark/Light toggle** | جابجایی تم Chocolate/Black به Light در تنظیمات | کم |
| **Customizable shortcuts** | امکان تغییر keybinding در Settings | متوسط |
| **Search در همه پنل‌ها** | جستجوی لایه، پراپ، طبقه، و تاریخچه | کم |
| **Inline rename** | تغییر نام لایه/طبقه با دوبار کلیک بدون modal | کم |
| **Minimap** | نمای کوچک نقشه برای navigation سریع در نقشه‌های بزرگ | متوسط |
| **Touch/pen support** | بهینه‌سازی برای تبلت و قلم (Pointer Events) | متوسط |

## ۳. Creative & Map Power

| پیشنهاد | توضیح | تلاش |
|---------|--------|------|
| **Tileset system** | آپلود و چیدمان tileهای تکرارشونده (walls/floors) | متوسط |
| **Dynamic lighting** | چراغ‌ها با شعاع و رنگ قابل تنظیم | متوسط |
| **Random dungeon generator** | تولید procedural dungeon با پارامترهای قابل تنظیم | متوسط |
| **Measurement tool** | خط‌کش و زاویه‌سنج روی canvas | کم |
| **Region labels** | متن‌های منحنی/دوران‌پذیر روی نقشه | کم |
| **Animated water/lava** | الگوهای CSS/Canvas متحرک برای عناصر محیطی | متوسط |
| **Import from Dungeon Scrawl JSON** | امکان import نقشه‌های اصلی | متوسط |

## ۴. Business & Collaboration

| پیشنهاد | توضیح | تلاز |
|---------|--------|------|
| **Shareable links** | لینک مشاهده/ویرایش با سطح دسترسی | متوسط |
| **Public gallery** | نمایشگاه نقشه‌های عمومی کاربران | متوسط |
| **Subscription tiers** | Free/Pro با محدودیت AI, storage, export | متوسط |
| **Comment on maps** | کامنت‌گذاری روی نقشه برای تیم | متوسط |
| **Version history** | ذخیره نسخه‌های قدیمی نقشه (snapshot) | متوسط |
| **Team workspaces** | فضای کاری مشترک با نقشه‌ها و اعضا | زیاد |

## مرحله بعدی
توصیه می‌شود **۲ یا ۳ مورد** از اولویت‌های بالا را انتخاب کنید تا در یک Sprint کوچک (چند فایل) پیاده‌سازی شوند. برای شروع، بهترین گزینه‌ها ترکیب زیر هستند:

1. **Auto-save indicator + Debounced history** (UX و پایداری فوری)
2. **Minimap** (نقشه‌کشی حرفه‌ای)
3. **Shareable links** (اشتراک‌گذاری واقعی)

آیا می‌خواهید این ۳ مورد را شروع کنیم یا موارد دیگری مد نظر دارید؟
