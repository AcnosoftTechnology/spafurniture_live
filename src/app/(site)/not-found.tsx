export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium tracking-wide text-stone-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-stone-500">
        The page you are looking for does not exist or is temporarily unavailable.
      </p>
    </main>
  );
}
