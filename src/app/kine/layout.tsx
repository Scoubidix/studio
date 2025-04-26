// This layout can be used for shared UI elements specific to the Kine section,
// like a sidebar or header elements different from the main layout.
// For now, it just renders the children.

export default function KineLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
