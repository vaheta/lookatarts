export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="h-screen flex flex-col">
        <div className="text-center pt-8">
          <p className="text-sm text-gray-500">lookatarts.com</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-black"></div>
        </div>
        <div className="text-center pb-8">
          <p className="text-sm text-gray-600">Picture of the day - Today</p>
        </div>
      </div>
    </div>
  );
} 