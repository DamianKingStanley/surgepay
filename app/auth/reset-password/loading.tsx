export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="inline-block mb-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#334039] to-[#334039] bg-clip-text text-transparent">
              Classika
            </span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#334039] mx-auto mb-4"></div>
          <h2 className="text-2xl text-[#334039] mb-2">Loading...</h2>
        </div>
      </div>
    </div>
  );
}
