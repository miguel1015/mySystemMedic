import 'server-only'

import { cookies } from 'next/headers'
import { Theme } from '@/themes/enum'

export const getPreferredTheme = (): Theme.Light | Theme.Dark => {
  const preferredThemeCookies = (cookies().get('preferred_theme')?.value ?? Theme.Light) as Theme

  if (preferredThemeCookies !== Theme.Light && preferredThemeCookies !== Theme.Dark) {
    return Theme.Light
  }

  return preferredThemeCookies
}

export default function getTheme(): Theme.Light | Theme.Dark {
  const themeCookies = cookies().get('theme')?.value as Theme | undefined
  const legacyPreferredThemeCookies = cookies().get('preferred_theme')?.value as Theme | undefined
  const currentTheme = themeCookies ?? legacyPreferredThemeCookies ?? Theme.Light

  if (currentTheme !== Theme.Light && currentTheme !== Theme.Dark) {
    return Theme.Light
  }

  return currentTheme
}
