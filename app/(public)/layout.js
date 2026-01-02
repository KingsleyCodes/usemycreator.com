export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">mycreator</h1>
          <nav className="space-x-4 text-sm">
            <a href="/login" className="hover:text-primary">Login</a>
            <a
              href="/register"
              className="bg-primary px-4 py-2 rounded-md text-black font-medium"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t text-center text-sm py-4 text-gray-500">
        © {new Date().getFullYear()} mycreator
      </footer>
    </div>
  );
}
