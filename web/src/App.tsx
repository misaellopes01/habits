import './lib/dayjs'
import { Header } from './components/Header'
import { SummaryTable } from './components/SummaryTable'
import './styles/global.css'
import { api } from './lib/axios'

// window.Notification.requestPermission((permission) => {
//   if (permission === 'granted') {
//     // eslint-disable-next-line no-new
//     new window.Notification('Habits', {
//       body: 'Texto',
//     })
//   }
// })
navigator.serviceWorker
  .register('service-worker.js')
  .then(async (serviceWorker) => {
    let subscription = await serviceWorker.pushManager.getSubscription()

    if (!subscription) {
      const notificationPublicKey = await api.get('/push/public_key')

      subscription = await serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: notificationPublicKey.data.publicKey,
      })
    }

    await api.post('/push/register', {
      subscription,
    })

    await api.post('/push/send', {
      subscription,
    })
  })

export function App() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-full max-w-5xl px-6 flex flex-col gap-16">
        <Header />
        <SummaryTable />
      </div>
    </div>
  )
}
