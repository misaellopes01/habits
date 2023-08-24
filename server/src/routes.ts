import { FastifyInstance } from "fastify"
import { z } from 'zod'
import dayjs from 'dayjs'
import { prisma } from "./lib/prisma"

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request, reply) => {

    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    })
    const { title, weekDays } = createHabitBody.parse(request.body)
    const today = dayjs().startOf('day').toDate()
    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map(weekDay => {
            return {
              week_day: weekDay
            }
          })
        }
      }
    })

    return reply.status(200).send()
  })

  app.get('/day', async (request, reply) => {
    const getDayParams = z.object({
      date: z.coerce.date()
    })
    const { date } = getDayParams.parse(request.query)
    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day')
    // all possible habits in that day
    // habits already completed
    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date
        },
        weekDays: {
          some: {
            week_day: weekDay
          }
        }
      }
    })

    const day = await prisma.day.findFirst({
      where: {
        date: parsedDate.toDate()
      }, 
      include: {
        dayHabits: true
      }
    })

    const completedHabits = day?.dayHabits.map(dayHabit => dayHabit.habit_id)

    return {
      possibleHabits,
      completedHabits
    }
  })
}


