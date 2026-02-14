import siteConfig from '@/libs/siteConfig'

const localeDateStringOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString(siteConfig.locale, localeDateStringOptions)
}
