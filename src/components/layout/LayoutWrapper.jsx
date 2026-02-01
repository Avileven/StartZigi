"use client";

import ClientLayout from "./ClientLayout";
import Footer from "./Footer"; // מוודא שהייבוא תקין מהקובץ שיצרת
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // דפים ציבוריים שמחוץ לדשבורד - יקבלו את הפוטר אבל לא את ה-ClientLayout
  const publicPages = [
    "/",
    "/login",
    "/register",
    "/why-startzig",
    "/pricing",
    "/community"
  ];

  if (publicPages.includes(pathname)) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* התוכן של הדף (כולל ה-Navbar שכבר נמצא בתוך הדפים) */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* הפוטר יופיע רק כאן, בתחתית הדפים הציבוריים */}
        <Footer />
      </div>
    );
  }

  // דפים פנימיים (Dashboard וכו') - משתמשים בלייאוט המורכב ללא הפוטר הציבורי
  return <ClientLayout>{children}</ClientLayout>;
}