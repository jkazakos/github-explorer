"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-900">
        <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">
            A critical error occurred!
          </h2>
          <p className="text-muted mb-8">
            {"An error occured. Please refresh the page."}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
