export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto py-4 px-6">
      <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
        Team Task Manager &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
