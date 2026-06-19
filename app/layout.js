export const metadata = {
  title: 'Nail Design Studio',
  description: 'Design your perfect nail look with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
