import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-muted-foreground">Page not found</p>
      <Link
        href="/"
        className="text-brand underline underline-offset-4 hover:text-brand-dark"
      >
        Go home
      </Link>
    </div>
  );
}
