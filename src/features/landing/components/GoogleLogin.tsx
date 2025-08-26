import React from 'react';

type GoogleLoginProps = {
  onClick?: () => void;
  label?: string;
  className?: string;
};

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
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google logo"
        className="h-5 w-5"
      />
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
}
