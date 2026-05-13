import siteConfig from '@/libs/siteConfig'

const localeDateStringOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString(siteConfig.locale, localeDateStringOptions)
}

export const formatShortDate = (date: Date) => {
  const month = date.toLocaleDateString(siteConfig.locale, { month: 'short' })
  const day = String(date.getDate()).padStart(2, '0')
  return `${month} ${day}`
}
