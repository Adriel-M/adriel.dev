import plugin from 'tailwindcss/plugin'

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      const sizes = ['xl', '4xl']
      const maxWidths = theme('maxWidth')
      const paddings = theme('padding')
      const padding1 = paddings['1']

      const tocStyles = {}

      sizes.forEach((size) => {
        const sizeValue = maxWidths[size]
        if (sizeValue) {
          const className = `.w-toc-${size}`
          tocStyles[className] = {
            width: `calc(50vw - (${sizeValue} / 2))`,
            transform: `translateX(calc(100% + ${padding1})) translateY(1rem)`,
          }
        }
      })

      addUtilities(tocStyles, { layer: 'utilities' })
    }),
  ],
}
