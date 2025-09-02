'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '@/lib/utils';

function Label({
  className,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  // Replace any literal '*' characters in text children with a red span
  const renderWithRedAsterisks = (node: React.ReactNode): React.ReactNode => {
    if (node == null) return node;

    // If it's an array, map each entry
    if (Array.isArray(node)) {
      return node.map((n, i) => (
        <React.Fragment key={i}>{renderWithRedAsterisks(n)}</React.Fragment>
      ));
    }

    // Strings: split on '*' and interleave with red '*' spans
    if (typeof node === 'string') {
      if (!node.includes('*')) return node;
      const parts = node.split('*');
      return parts.reduce<React.ReactNode[]>((acc, part, idx) => {
        if (part) acc.push(part);
        if (idx < parts.length - 1)
          acc.push(
            <span key={idx} className="text-red-600">
              *
            </span>
          );
        return acc;
      }, []);
    }

    // React element: clone and process its children
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<any>;
      const childProps: any = element.props || {};
      const processedChildren = renderWithRedAsterisks(childProps.children);
      return React.cloneElement(
        element,
        { ...(element.props as Record<string, any>) },
        processedChildren
      );
    }

    // Other types (numbers, booleans, etc.) just return as-is
    return node;
  };

  const processed = renderWithRedAsterisks(children);

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    >
      {processed}
    </LabelPrimitive.Root>
  );
}

export { Label };
