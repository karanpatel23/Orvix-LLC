import Image from 'next/image';
export default function Logo({ compact=false }: { compact?: boolean }) {
  return <Image src='/orvix-logo.svg' alt='ORVIX LLC' width={compact ? 154 : 188} height={compact ? 34 : 42} priority />;
}
