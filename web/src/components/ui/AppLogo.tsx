import Image from 'next/image';

interface Props {
  size?: number;
}

export default function AppLogo({ size = 32 }: Props) {
  return (
    <Image
      src="/assets/images/app_logo.png"
      alt="Hello-Hedera-Pay logo"
      width={size}
      height={size}
      className="rounded-lg"
      priority
    />
  );
}
