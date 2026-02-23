export default function Footer() {
  return (
    <footer className="h-12 flex items-center px-6 border-t border-gray-100 dark:border-slate-800">
      <p className="text-xs text-gray-400 dark:text-slate-600">
        © {new Date().getFullYear()} Galang Rizky Arridho. All rights reserved.
      </p>
    </footer>
  );
}