/**
 * Reusable loading spinner component
 */
export default function LoadingSpinner({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="text-secondary fw-medium">{message}</p>
    </div>
  );
}
