export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#334039] mx-auto mb-4"></div>
          <h2 className="text-2xl text-[#334039] mb-2">Loading...</h2>
          <p className="text-gray-600">Preparing your onboarding experience</p>
        </div>
      </div>
    </div>
  );
}
