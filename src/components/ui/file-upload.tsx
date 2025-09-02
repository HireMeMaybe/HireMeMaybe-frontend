'use client';

import * as React from 'react';
import { X, Upload } from 'lucide-react';

import { cn } from '@/lib/utils';

type FileUploadProps = {
  file?: File | null;
  accept?: string;
  maxSize?: number; // bytes
  onFileChange?: (file: File | null) => void;
  className?: string;
  description?: string;
};

function FileUpload({
  file,
  accept,
  maxSize,
  onFileChange,
  className,
  description,
}: FileUploadProps) {
  const fileName = file?.name;
  const isImage = file?.type?.startsWith('image/');
  const isPdf = file?.type === 'application/pdf';

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className={cn('relative', className)}>
      {file ? (
        <div
          className="border-border bg-muted/30 relative rounded-xl border-2 p-4"
          onClick={() => inputRef.current?.click()}
        >
          <div className="relative">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl ?? undefined}
                alt="preview"
                className="h-48 w-full rounded-lg bg-white object-contain"
              />
            ) : isPdf ? (
              <div className="h-48 w-full overflow-auto rounded-lg bg-white">
                {previewUrl ? (
                  <iframe src={previewUrl} className="h-full w-full" title="pdf-preview" />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                    <Upload className="h-10 w-10" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-lg bg-white">
                <Upload className="text-muted-foreground h-10 w-10" />
              </div>
            )}
          </div>

          {/* remove button positioned outside preview */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange?.(null);
            }}
            className="absolute -top-3 -right-3 z-30 rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mt-3 text-center">
            <p className="text-muted-foreground truncate text-sm">
              <span className="block truncate font-semibold">{fileName}</span>
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              Click the X to remove or click anywhere to upload a new file
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="pointer-events-none absolute inset-0 z-0 opacity-0"
            onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
          />
        </div>
      ) : (
        <div className="border-border bg-muted/50 text-gray-text relative overflow-hidden rounded-xl border-2 border-dashed p-10 text-center">
          <div className="relative z-10">
            <Upload className="text-muted-foreground text-gray-text mx-auto mb-3 h-10 w-10" />
            <p className="text-muted-foreground text-lighter-gray-text mb-1 text-base font-medium">
              Upload File
            </p>
            <p className="text-muted-foreground text-lighter-gray-text text-sm">
              {description ?? accept ?? 'PDF, images up to allowed size'}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="absolute inset-0 z-20 cursor-pointer opacity-0"
            onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
          />
        </div>
      )}
    </div>
  );
}

export { FileUpload };
