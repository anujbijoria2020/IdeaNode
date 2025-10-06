export function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-white text-center px-4">
      <div className="max-w-md">
        <h1 className="text-6xl font-extrabold mb-6 text-purple-700">404</h1>
        <h2 className="text-3xl font-semibold mb-4 text-purple-600">
          Page Not Found
        </h2>
        <p className="text-purple-500 mb-8">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}
