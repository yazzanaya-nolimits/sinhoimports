import { supabase } from '@/integrations/supabase/client';

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);

export type UploadedImage = {
  url: string;
  path: string;
};

export function validateImage(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!allowedMimeTypes.has(file.type) || !extension || !allowedExtensions.has(extension)) {
    return 'Use uma imagem JPG, PNG ou WebP.';
  }
  if (file.size > IMAGE_MAX_BYTES) return 'A imagem deve ter no máximo 5 MB.';
  return null;
}

export async function uploadPublicImage(
  file: File,
  bucket: 'produtos' | 'site-imagens',
  folder?: string,
): Promise<UploadedImage> {
  const validationError = validateImage(file);
  if (validationError) throw new Error(validationError);

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const path = folder ? `${folder}/${fileName}` : fileName;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function removePublicImage(bucket: 'produtos' | 'site-imagens', path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex < 0) return null;
  const encodedPath = url.slice(markerIndex + marker.length).split('?')[0];
  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return encodedPath;
  }
}