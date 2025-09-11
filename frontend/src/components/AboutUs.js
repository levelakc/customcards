import React from 'react';

export default function AboutUs() {
    return (
        <div className="bg-gray-900 py-20 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold mb-8">איך זה עובד?</h2>
                <div className="grid md:grid-cols-3 gap-8 text-lg">
                    <div className="flex flex-col items-center">
                        <div className="bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">1</div>
                        <h3 className="font-bold mb-2">מבצעים הזמנה</h3>
                        <p className="text-gray-400">בוחרים עיצוב מהקולקציה שלנו או מעצבים בעצמכם את כרטיס המתכת המושלם.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">2</div>
                        <h3 className="font-bold mb-2">אנחנו יוצרים קשר</h3>
                        <p className="text-gray-400">לאחר ההזמנה, ניצור עמכם קשר ב-WhatsApp ונשלח תמונה של המוצר הסופי לאישורכם.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">3</div>
                        <h3 className="font-bold mb-2">משלוח עד הבית</h3>
                        <p className="text-gray-400">לאחר אישורכם, שליח יגיע עד אליכם תוך 7 ימי עסקים עם הכרטיס החדש שלכם!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}