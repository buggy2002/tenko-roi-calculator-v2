import { deepMerge } from '@antfu/utils'
import { useI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { VVideo } from 'vuetify/labs/VVideo'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import defaults from './defaults'
import { icons } from './icons'
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from './theme'
import { themeConfig } from '@themeConfig'
import { getI18n } from '@/plugins/i18n/index'

// Styles
import { cookieRef } from '@/@layouts/stores/config'
import '@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'

const legacyPrimaryColors = new Set(['#7367f0', '#675dd8'])

const resolvePrimaryColor = (value, fallback) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : ''

  if (!normalized || legacyPrimaryColors.has(normalized))
    return fallback

  return value
}

export default function (app) {
  const lightPrimary = cookieRef('lightThemePrimaryColor', staticPrimaryColor)
  const lightPrimaryDarken = cookieRef('lightThemePrimaryDarkenColor', staticPrimaryDarkenColor)
  const darkPrimary = cookieRef('darkThemePrimaryColor', staticPrimaryColor)
  const darkPrimaryDarken = cookieRef('darkThemePrimaryDarkenColor', staticPrimaryDarkenColor)

  const cookieThemeValues = {
    defaultTheme: resolveVuetifyTheme(themeConfig.app.theme),
    themes: {
      light: {
        colors: {
          'primary': resolvePrimaryColor(lightPrimary.value, staticPrimaryColor),
          'primary-darken-1': resolvePrimaryColor(lightPrimaryDarken.value, staticPrimaryDarkenColor),
        },
      },
      dark: {
        colors: {
          'primary': resolvePrimaryColor(darkPrimary.value, staticPrimaryColor),
          'primary-darken-1': resolvePrimaryColor(darkPrimaryDarken.value, staticPrimaryDarkenColor),
        },
      },
    },
  }

  const optionTheme = deepMerge({ themes }, cookieThemeValues)

  const vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
    },
    components: {
      VVideo,
    },
    defaults,
    icons,
    theme: optionTheme,
    locale: {
      adapter: createVueI18nAdapter({ i18n: getI18n(), useI18n }),
    },
  })

  app.use(vuetify)
}
