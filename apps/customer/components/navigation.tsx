import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      <Link
        href="/categories"
        className="transition-colors hover:text-foreground/80 text-foreground/60"
      >
        Menu
      </Link>
      <Link
        href="/search"
        className="transition-colors hover:text-foreground/80 text-foreground/60"
      >
        Search
      </Link>
    </nav>
  );
}
