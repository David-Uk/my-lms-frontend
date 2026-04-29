export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>

      <div className="h-96 bg-gray-50 rounded-2xl animate-pulse" />
    </div>
  );
}
