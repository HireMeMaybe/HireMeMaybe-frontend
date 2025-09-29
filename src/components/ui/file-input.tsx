'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type FileInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  onFileChange?: (file: File | null) => void;
};

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onFileChange, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none md:text-sm',
          className
        )}
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onFileChange?.(file);
          if (props.onChange) props.onChange(e);
        }}
        {...props}
      />
    );
  }
);

FileInput.displayName = 'FileInput';

export { FileInput };
