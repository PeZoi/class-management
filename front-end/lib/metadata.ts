import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

/**
 * Helper function để generate metadata cho các trang với translation
 * @param locale - Locale hiện tại
 * @param titleKey - Key trong translation file cho title
 * @param descriptionKey - Key trong translation file cho description (optional)
 * @param namespace - Namespace trong translation file (default: 'common')
 * @returns Metadata object
 */
export async function generatePageMetadata(
  locale: string,
  titleKey: string,
  descriptionKey?: string,
  namespace: string = 'common'
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  const metadata: Metadata = {
    title: t(titleKey),
  };

  if (descriptionKey) {
    metadata.description = t(descriptionKey);
  }

  return metadata;
}

/**
 * Tạo generateMetadata function để export trong page.tsx
 * Tái sử dụng toàn bộ logic, chỉ cần truyền titleKey
 * 
 * @param titleKey - Key trong translation file cho title
 * @param descriptionKey - Key trong translation file cho description (optional)
 * @param namespace - Namespace trong translation file (default: 'common')
 * @returns generateMetadata function
 * 
 * @example
 * ```tsx
 * export const { generateMetadata } = createPageMetadata('dashboard');
 * ```
 */
export function createPageMetadata(
  titleKey: string,
  descriptionKey?: string,
  namespace: string = 'common'
) {
  return {
    async generateMetadata({
      params,
    }: {
      params: Promise<{ locale: string }>;
    }): Promise<Metadata> {
      const { locale } = await params;
      return generatePageMetadata(locale, titleKey, descriptionKey, namespace);
    },
  };
}

