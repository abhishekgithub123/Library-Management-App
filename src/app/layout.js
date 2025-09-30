import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../components/QueryProvider";
import { LanguageProvider } from "../components/language-provider";
import { ThemeRegistry } from "../components/ThemeRegistry";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../contexts/AuthContext";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Library Admin App",
  description: "Library Administration System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <QueryProvider>
          <AuthProvider>
            <LanguageProvider>
              {/* <ThemeRegistry options={{ key: "mui", prepend: true }}> */}
                {children}
                <ToastProvider />
              {/* </ThemeRegistry> */}
            </LanguageProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
