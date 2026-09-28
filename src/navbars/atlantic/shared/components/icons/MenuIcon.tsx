
import { Menu } from 'lucide-react';
import { useMenuModalStore } from '@lab/stubs';

interface MenuIconProps {
  buttonClassName?: string;
  iconClassName?: string;
  /** Visible text beside the icon (the Atlantic's "Menu"). Omit for icon only. */
  label?: string;
  labelClassName?: string;
}

export default function MenuIcon({
  buttonClassName = '',
  iconClassName = '',
  label,
  labelClassName = '',
}: MenuIconProps) {
  const { openMenuModal } = useMenuModalStore();

  return (
    <button
      onClick={openMenuModal}
      className={`inline-flex items-center justify-center gap-2 p-0 leading-none bg-transparent border-0 cursor-pointer focus:outline-none hover:opacity-70 transition-opacity ${buttonClassName}`}
      aria-label={label ? undefined : 'Open menu modal'}
    >
      <Menu
        aria-hidden
        strokeWidth={1.5}
        className={`shrink-0 text-white cursor-pointer ${iconClassName}`}
      />
      {label ? <span className={`font-[family-name:var(--font-dm-sans)] ${labelClassName}`}>{label}</span> : null}
    </button>
  );
}
