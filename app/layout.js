import "./globals.css";

export const metadata = {
  title: "mycreator",
  description: "Connect businesses with micro-content creators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
