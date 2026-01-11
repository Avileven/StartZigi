// app/promotion/page.jsx/ 11126
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // [2026-01-11] FIX: useSearchParams במקום window.location.search (יותר יציב ב-Next)
import InAppPromotion from "@/components/promotions/InAppPromotion";
import EmailPromotion from "@/components/promotions/EmailPromotion";

// [2026-01-11] FIX: אל תסמוך על createPageUrl כאן כדי לא ליפול על בעיות אותיות גדולות/קטנות.
// קבע נתיב אמיתי לפי שם התיקייה ב-app.
const BACK_ROUTE = "/promotion-center"; // [2026-01-11] FIX: עדכן אם אצלך זה /PromotionCenter או /promotioncenter וכו'

export default function PromotionPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // [2026-01-11] FIX
  const [promotionType, setPromotionType] = useState(null);

  useEffect(() => {
    const type = searchParams.get("type"); // [2026-01-11] FIX: קריאה נכונה לפרמטרים
    setPromotionType(type);

    // [2026-01-11] FIX: אם אין type—חוזרים למרכז. replace כדי לא להכניס את /promotion להיסטוריה בלופ.
    if (!type) {
      router.replace(BACK_ROUTE);
    }
  }, [searchParams, router]);

  const goBack = () => {
    router.push(BACK_ROUTE); // [2026-01-11] FIX: נתיב ברור וקבוע
  };

  if (promotionType === "in-app") {
    return <InAppPromotion goBack={goBack} />;
  }

  if (promotionType === "email") {
    return <EmailPromotion goBack={goBack} />;
  }

  // [2026-01-11] NOTE: בזמן שה-router.replace רץ/עד שה-state מתעדכן, נחזיר null.
  return null;
}

