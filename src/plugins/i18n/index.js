import { createI18n } from 'vue-i18n'
import { cookieRef } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'
import { uiLabels, uiText } from '@/utils/roi/ui-copy.js'
import { uiScenarioText } from '@/utils/roi/ui-scenario-copy.js'

const roiNavbarText = {
  th: { brand: 'Tenko ROI Calculator', language: 'ภาษา' },
  en: { brand: 'Tenko ROI Calculator', language: 'Language' },
  ja: { brand: 'Tenko ROI Calculator', language: '言語' },
}

const roiScenarioExtraText = {
  th: { save: 'บันทึก', list: 'รายการ', cancel: 'ยกเลิก', close: 'ปิด' },
  en: { save: 'Save', list: 'List', cancel: 'Cancel', close: 'Close' },
  ja: { save: '保存', list: '一覧', cancel: 'キャンセル', close: '閉じる' },
}

const messages = Object.fromEntries(Object.entries(import.meta.glob('./locales/*.json', { eager: true }))
  .map(([key, value]) => [key.slice(10, -5), value.default]))

for (const [locale, localeMessages] of Object.entries(messages)) {
  const roiText = uiText[locale] ?? uiText.en
  const roiLabelsText = uiLabels[locale] ?? uiLabels.en
  const roiScenario = uiScenarioText[locale] ?? uiScenarioText.en
  const navbarText = roiNavbarText[locale] ?? roiNavbarText.en
  const roiScenarioText = roiScenarioExtraText[locale] ?? roiScenarioExtraText.en

  messages[locale] = {
    ...localeMessages,
    roi: {
      ...roiText,
      ...navbarText,
    },
    roiLabels: roiLabelsText,
    roiScenario: {
      ...roiScenario,
      ...roiScenarioText,
    },
  }
}

let _i18n = null
export const getI18n = () => {
  if (_i18n === null) {
    _i18n = createI18n({
      legacy: false,
      locale: cookieRef('language', themeConfig.app.i18n.defaultLocale).value,
      fallbackLocale: 'en',
      messages,
    })
  }
  
  return _i18n
}
export default function (app) {
  app.use(getI18n())
}
