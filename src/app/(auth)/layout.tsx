export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <a href="/" className="mb-10 text-2xl font-bold tracking-tight">
        Viral<span className="text-[#FF2D55]">Clip</span>
      </a>
      {children}
    </div>
  );
}
