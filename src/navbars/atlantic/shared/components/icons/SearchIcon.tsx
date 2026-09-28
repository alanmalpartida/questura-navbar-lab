
import { Search } from 'lucide-react';

interface SearchIconProps {
  buttonClassName?: string;
  iconClassName?: string;
}

// Questura has no search modal yet; this is a placeholder button.
export default function SearchIcon({ buttonClassName = '', iconClassName = '' }: SearchIconProps) {
  return (
    <button
      className={`inline-flex items-center justify-center p-0 leading-none bg-transparent border-0 cursor-pointer focus:outline-none hover:opacity-70 transition-opacity ${buttonClassName}`}
      aria-label="Search"
    >
      <Search aria-hidden strokeWidth={1.75} className={`shrink-0 ${iconClassName}`} />
    </button>
  );
}
