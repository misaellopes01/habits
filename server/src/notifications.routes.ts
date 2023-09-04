import WebPush from 'web-push'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const keys = WebPush.generateVAPIDKeys()

const publicKey =
  'BJws0NDUYrNV0bxLsshRCnf8y3k0KuzPNd-eYI8MwkwEgBb4tarLgdMPktj1r_LGxWBnIQyCy2vIe8HDvt5KYbg'
const privateKey = 'alQWdit3OaV5eYykMF7qqVqnYpym31arKDyCFrGL2Hw'

WebPush.setVapidDetails('https://localhost:3333', publicKey, privateKey)

export async function notificationsRoutes(app: FastifyInstance) {
  app.get('/push/public_key', () => {
    return {
      publicKey,
    }
  })

  app.post('/push/register', (request, reply) => {
    return reply.status(201).send()
  })

  app.post('/push/send', async (request, reply) => {
    const sendPushBody = z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    })

    const { subscription } = sendPushBody.parse(request.body)

    setTimeout(() => {
      WebPush.sendNotification(subscription, 'Hello do Backend')
    }, 5000)

    return reply.status(201).send()
  })
}
