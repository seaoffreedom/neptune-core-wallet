import { HeaderCenter } from './HeaderCenter';
import { HeaderIcon } from './HeaderIcon';
import { HeaderLeft } from './HeaderLeft';
import { HeaderRight } from './HeaderRight';

export function Header() {
  return (
    <header className="border-b bg-background h-16 flex items-center">
      <HeaderIcon />
      <div className="flex-1 flex items-center justify-between px-4">
        <HeaderLeft />
        <HeaderCenter />
        <HeaderRight />
      </div>
    </header>
  );
}
