import { setupWorker } from 'msw/browser'

// Handlers
import { handlerAppBarSearch } from '@db/app-bar-search/index'
import { handlerAppsAcademy } from '@db/apps/academy/index'
import { handlerAppsCalendar } from '@db/apps/calendar/index'
import { handlerAppsChat } from '@db/apps/chat/index'
import { handlerAppsEcommerce } from '@db/apps/ecommerce/index'
import { handlerAppsEmail } from '@db/apps/email/index'
import { handlerAppsInvoice } from '@db/apps/invoice/index'
import { handlerAppsKanban } from '@db/apps/kanban/index'
import { handlerAppLogistics } from '@db/apps/logistics/index'
import { handlerAppsPermission } from '@db/apps/permission/index'
import { handlerAppsUsers } from '@db/apps/users/index'
import { handlerAuth } from '@db/auth/index'
import { handlerDashboard } from '@db/dashboard/index'
import { handlerPagesDatatable } from '@db/pages/datatable/index'
import { handlerPagesFaq } from '@db/pages/faq/index'
import { handlerPagesHelpCenter } from '@db/pages/help-center/index'
import { handlerPagesProfile } from '@db/pages/profile/index'
import { handlerRoi } from '@db/roi/index'

const worker = setupWorker(...handlerAppsEcommerce, ...handlerAppsAcademy, ...handlerAppsInvoice, ...handlerAppsUsers, ...handlerAppsEmail, ...handlerAppsCalendar, ...handlerAppsChat, ...handlerAppsPermission, ...handlerPagesHelpCenter, ...handlerPagesProfile, ...handlerPagesFaq, ...handlerPagesDatatable, ...handlerAppBarSearch, ...handlerAppLogistics, ...handlerAuth, ...handlerAppsKanban, ...handlerDashboard, ...handlerRoi)
export default function () {
  const isMockApiEnabled = import.meta.env.VITE_ENABLE_MSW === 'true'

  if (!isMockApiEnabled) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          registrations
            .filter(registration => registration.active?.scriptURL?.includes('mockServiceWorker.js'))
            .forEach(registration => registration.unregister())
        })
        .catch(() => {})
    }

    return
  }

  const workerUrl = `${import.meta.env.BASE_URL ?? '/'}mockServiceWorker.js`

  worker.start({
    serviceWorker: {
      url: workerUrl,
    },
    onUnhandledRequest: 'bypass',
  })
}
