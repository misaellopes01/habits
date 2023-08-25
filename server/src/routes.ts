import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import dayjs from 'dayjs'
import { prisma } from './lib/prisma'

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request, reply) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    })
    const { title, weekDays } = createHabitBody.parse(request.body)
    const today = dayjs().startOf('day').toDate()
    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            }
          }),
        },
      },
    })

    return reply.status(200).send()
  })

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    })
    const { date } = getDayParams.parse(request.query)
    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day')
    // all possible habits in that day
    // habits already completed
    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    })

    const day = await prisma.day.findFirst({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    })

    const completedHabits =
      day?.dayHabits.map((dayHabit) => dayHabit.habit_id) ?? []

    return {
      possibleHabits,
      completedHabits,
    }
  })

  // set/unset as completed
  // if I want to implement a feature that allow the user complete an habit in a
  // specific day I must modify the code to work with this rule
  app.patch('/habits/:id/toggle', async (request) => {
    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = toggleHabitParams.parse(request.params)
    const today = dayjs().startOf('day').toDate()

    let day = await prisma.day.findFirst({
      where: {
        date: today,
      },
    })

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      })
    }
    // verifying if the habit is already completed in that day
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    })
    // if yes, unset completed
    if (dayHabit) {
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      })
    } else {
      // set completed
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      })
    }
  })

  app.get('/summary', async () => {
    // [{}, {}, {}]
    // total of possible habits in that date and how much I've completed, and comparison between
    const summary = await prisma.$queryRaw`
    SELECT 
      D.id, 
      D.date,
      (
        SELECT 
          cast(count(*) as float)
        FROM day_habits DH
        WHERE DH.day_id = D.id
      ) as completed,
      (
        SELECT 
          cast(count(*) as float)
        FROM habit_week_days HWD
        JOIN habits H
          ON H.id = HWD.habit_id
        WHERE 
          HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
          AND H.created_at <= D.date
      ) as amount
    FROM days D
    `

    return summary
  })
}
