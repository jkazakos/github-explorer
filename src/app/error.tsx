'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h2 className="mb-4 text-2xl font-bold text-red-500">Something went wrong!</h2>
      <p className="mb-8 text-muted">{'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-6 py-2 transition-colors hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}
