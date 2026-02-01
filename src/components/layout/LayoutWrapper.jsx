// C:\STRARTZIG\src\components\layout\LayoutWrapper

"use client";



import ClientLayout from "./ClientLayout";

import { usePathname } from "next/navigation";



export default function LayoutWrapper({ children }) {

  const pathname = usePathname();



  // ✅ [2026-01-03] דפים שמחוץ לדשבורד

  if (

    pathname === "/" ||

    pathname === "/login" ||

    pathname === "/register"

  ) {

    return <>{children}</>;

  }



  return <ClientLayout>{children}</ClientLayout>;

}
