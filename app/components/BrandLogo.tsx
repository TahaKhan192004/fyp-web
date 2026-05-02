import Image from 'next/image';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 32, className = '' }: BrandLogoProps) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/if-logo.png"
        alt="IntelliFone logo"
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={size >= 40}
      />
    </span>
  );
}
