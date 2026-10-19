import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
