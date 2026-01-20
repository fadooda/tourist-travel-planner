// components/brand/logo.tsx
import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/discover-egypt-logo.svg"   // (if it's actually PNG, use /logo.png)
        alt="Discover Egypt"
        width={800}
        height={800}
        priority
        className="h-16 w-auto object-contain md:h-20"
      />
    </Link>
  );
}
