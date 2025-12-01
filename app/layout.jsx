import { Toaster } from "@/components/ui/toaster";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import "./globals.css";

export const metadata = {
  title: "StartZig - Build Your Startup",
  description: "The ultimate startup simulator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
