import "./globals.css";

export const metadata = {
  title: "Face Tracking App",
  description: "Next.js Face Tracking App with Video Recording",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
