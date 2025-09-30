import React from 'react';
import Image from 'next/image';

type GoogleLoginProps = Readonly<{
  onClick?: () => void;
  label?: string;
  className?: string;
}>;

export default function GoogleLogin({
  onClick,
  label = 'Continue with Google',
  className = '',
}: GoogleLoginProps) {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-200 ${className}`}
    >
      <div className="relative h-5 w-5">
        <Image
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          width={20}
          height={20}
          unoptimized
          className="object-contain"
        />
      </div>
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
}
