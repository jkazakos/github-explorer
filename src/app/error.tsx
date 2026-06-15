"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h2 className="text-2xl font-bold mb-4 text-red-500">
        Something went wrong!
      </h2>
      <p className="text-muted mb-8">{"An unexpected error occurred."}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
