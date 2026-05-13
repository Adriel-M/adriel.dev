import siteConfig from '@/libs/siteConfig'

const localeDateStringOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

const shortDateOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString(siteConfig.locale, localeDateStringOptions)
}

export const formatShortDate = (date: Date) => {
  return date.toLocaleDateString(siteConfig.locale, shortDateOptions)
}
