import React from 'react';

export default function PolicyPage() {
    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold mb-8 font-dancing">מדיניות וביטול רכישה</h1>
                <div className="prose prose-invert text-gray-300 space-y-4">
                    <p>אנו ב-VIPCard שואפים לספק לכם את המוצר האיכותי ביותר. כל כרטיס מיוצר בהתאמה אישית מלאה לפי דרישת הלקוח.</p>
                    <p><strong>מדיניות ביטולים:</strong> מאחר וכל מוצר מיוצר באופן אישי וייחודי עבור הלקוח, לא ניתן לבטל עסקה לאחר שהמוצר נכנס לתהליך הייצור. ניתן לבטל עסקה עד 24 שעות מרגע ביצוע ההזמנה וקבלת אישור במייל.</p>
                    <p><strong>אחריות:</strong> אנו מספקים אחריות מלאה על תקינות הכרטיס ואיכות החריטה. במידה וקיים פגם במוצר שאינו נגרם משימוש לקוי, נשמח להחליפו במוצר חדש.</p>
                    <p><strong>אבטחת מידע:</strong> פרטי כרטיס האשראי שלכם אינם נשמרים במערכות שלנו. תהליך הסליקה מתבצע באמצעות ספק חיצוני מאובטח בתקן PCI DSS Level 1. אנו מתחייבים לא להעביר את פרטיכם האישיים לצד שלישי.</p>
                </div>
            </div>
        </div>
    );
}