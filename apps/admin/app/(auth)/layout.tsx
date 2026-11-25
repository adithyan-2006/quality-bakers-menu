export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center glass-canvas-bg p-4">
      {children}
    </div>
  );
}
