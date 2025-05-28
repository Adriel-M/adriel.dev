import fs from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from '@vercel/og'
import type { APIRoute } from 'astro'

interface Props {
  title: string
  logoBase64: string
}

function OgImage({ title, logoBase64 }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '-.02em',
        fontWeight: 700,
        background: 'white',
      }}
    >
      <div
        style={{
          left: 42,
          top: 42,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src={logoBase64} width={64} height={64} alt="Logo" />
        <span
          style={{
            marginLeft: 14,
            fontSize: 26,
          }}
        >
          adriel.dev
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '20px 50px',
          margin: '0 42px',
          fontSize: 40,
          width: 'auto',
          maxWidth: 900,
          textAlign: 'center',
          backgroundColor: 'black',
          color: 'white',
          lineHeight: 1.4,
        }}
      >
        {title}
      </div>
    </div>
  )
}

type TitleInput =
  | string
  | ((params: Record<string, string | undefined>) => string | Promise<string>)

export function generateGet(titleInput: TitleInput) {
  const GET: APIRoute = async ({ params }) => {
    const title = typeof titleInput === 'function' ? await titleInput(params) : titleInput
    const svgPath = path.resolve('./src/assets/logo.min.svg')
    const svgBuffer = await fs.readFile(svgPath)
    const logoBase64 = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`

    const fontPath = path.resolve('./src/assets/JetBrainsMono-Bold.ttf')
    const fontData = await fs.readFile(fontPath)

    return new ImageResponse(OgImage({ title, logoBase64 }), {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Jetbrains Mono',
          data: fontData,
          style: 'normal',
          weight: 900,
        },
      ],
    })
  }

  return { GET }
}
