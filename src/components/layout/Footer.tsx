import { FooterCenter } from './FooterCenter';
import { FooterIcon } from './FooterIcon';
import { FooterLeft } from './FooterLeft';
import { FooterRight } from './FooterRight';

export function Footer() {
  return (
    <footer className="border-t bg-background h-16 flex items-center">
      <FooterIcon />
      <div className="flex-1 flex items-center justify-between px-4">
        <FooterLeft />
        <FooterCenter />
        <FooterRight />
      </div>
    </footer>
  );
}
