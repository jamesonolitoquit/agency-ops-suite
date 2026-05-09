import Link from 'next/link';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function CTAButton({ href, children }: CTAButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-400 shadow-lg hover:shadow-glow"
    >
      {children}
    </Link>
  );
}
