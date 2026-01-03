
// /C:\STRARTZIG\src\components\layout\LayoutWrapper
"use client";

import ClientLayout from "./ClientLayout";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // ✅ [2026-01-03] HOME (/) בלי דשבורד
  if (pathname === "/") {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}

