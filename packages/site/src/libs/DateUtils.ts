const localeDateStringOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

export const formatDate = (date: Date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, localeDateStringOptions)
}
