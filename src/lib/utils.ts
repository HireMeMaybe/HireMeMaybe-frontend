import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a proxied URL for profile images to avoid rate limiting issues
 * @param imageUrl - The original image URL
 * @returns Proxied URL or original URL if not a Google image
 */
export function getProfileImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;

  // If it's a Google profile image, use our proxy to avoid rate limiting
  if (
    imageUrl.startsWith('https://lh3.googleusercontent.com/') ||
    imageUrl.startsWith('https://lh4.googleusercontent.com/') ||
    imageUrl.startsWith('https://lh5.googleusercontent.com/') ||
    imageUrl.startsWith('https://lh6.googleusercontent.com/')
  ) {
    return `/api/file/profile-image?url=${encodeURIComponent(imageUrl)}`;
  }

  return imageUrl;
}
