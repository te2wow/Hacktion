export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-600"></div>
        <div className="w-12 h-12 rounded-full border-4 border-hacktion-orange border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <span className="ml-3 text-gray-400">Loading team data...</span>
    </div>
  );
}