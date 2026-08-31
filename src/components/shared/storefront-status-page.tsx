type StorefrontStatusPageProps = {
  title: string;
  message: string;
};

export function StorefrontStatusPage({
  title,
  message,
}: StorefrontStatusPageProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-center text-zinc-600">{message}</p>
    </main>
  );
}
