import { ImageResponse } from 'next/og'
import { AppIcon } from '@/components/app-icon'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const size = parseInt(searchParams.get('size') || '512')
  
  return new ImageResponse(
    <AppIcon size={size} />,
    {
      width: size,
      height: size,
    }
  )
}