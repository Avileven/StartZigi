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
      <head>
        {/* Google Analytics — G-FH0K64C8Y9 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FH0K64C8Y9"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-FH0K64C8Y9');
        `}} />
      </head>
      <body className="overflow-x-hidden">
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster />
      </body>
    </html>
  );
}
