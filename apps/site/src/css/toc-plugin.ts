import plugin from 'tailwindcss/plugin'

// Generates w-toc-{xl,4xl}: positions the floating TOC in the margin beside the
// centered content area. Used in src/components/floating-toc/FloatingToc.astro.
export default plugin(function ({ addUtilities, theme }) {
  const sizes = ['xl', '4xl'] as const
  const maxWidths = theme('maxWidth') as Record<string, string>
  const padding1 = theme('padding.1') as string

  const tocStyles: Record<string, Record<string, string>> = {}

  for (const size of sizes) {
    const sizeValue = maxWidths[size]
    if (sizeValue) {
      tocStyles[`.w-toc-${size}`] = {
        width: `calc(50vw - (${sizeValue} / 2))`,
        transform: `translateX(calc(100% + ${padding1})) translateY(1rem)`,
      }
    }
  }

  addUtilities(tocStyles)
})
