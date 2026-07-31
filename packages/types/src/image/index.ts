import type { ImageId, ISODateString } from '../common';

/**
 * Predefined image variants/sizes.
 * Intended to be used by the image service to identify processing targets.
 */
export type ImageVariant = 'thumbnail' | 'medium' | 'large' | 'original';

/**
 * Details for a specific uploaded image variant.
 * Intended to represent a single processed image file.
 */
export interface ImageMetadata {
  /** Unique variant ID or path */
  id: string;
  /** URL to access the image */
  url: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Size in bytes */
  sizeBytes: number;
  /** MIME type */
  mimeType: string;
}

/**
 * Represents a complete image resource with its variants.
 * Intended to be stored alongside entities like Products.
 */
export interface ImageUpload {
  /** Unique ID of the image group */
  id: ImageId;
  /** Original filename */
  filename: string;
  /** Base URL path to the image directory */
  basePath: string;
  /** Map of variant types to their metadata */
  variants: Record<ImageVariant, ImageMetadata>;
  /** Timestamp when uploaded */
  createdAt: ISODateString;
}
