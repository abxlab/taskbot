import "./globals.css";

export const metadata = {
  title: "Task Dashboard",
  description: "Manage your tasks easily",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
