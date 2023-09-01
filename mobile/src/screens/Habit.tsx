import { Alert, ScrollView, Text, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import { BackButton } from '../components/BackButton'
import dayjs from 'dayjs'
import { ProgressBar } from '../components/ProgressBar'
import { CheckBox } from '../components/CheckBox'
import { useEffect, useState } from 'react'
import { Loading } from '../components/Loading'
import { api } from '../lib/axios'
import { generateProgressPercentage } from '../utils/generate-progress-percentage'
import { EmptyHabits } from '../components/EmptyHabits'
import clsx from 'clsx'

interface Params {
  date: string
}

interface HabitsInfo {
  possibleHabits: {
    id: string
    title: string
    created_at: string
  }[]
}

export function Habit() {
  const [loading, setLoading] = useState(true)
  const [habitsInfo, setHabitsInfo] = useState<HabitsInfo | null>(null)
  const [completedHabits, setCompletedHabits] = useState<string[]>([])

  const route = useRoute()
  const { date } = route.params as Params
  const parsedDate = dayjs(date)
  const isDateInPast = parsedDate.endOf('day').isBefore(new Date())
  const dayOfWeek = parsedDate.format('dddd')
  const dayAndMonth = parsedDate.format('DD/MM')

  const completedPercentage = habitsInfo?.possibleHabits.length
    ? Number(
        generateProgressPercentage(
          habitsInfo.possibleHabits.length,
          completedHabits.length,
        ),
      )
    : 0

  async function getDayHabits() {
    try {
      setLoading(true)
      const response = await api.get('/day', {
        params: {
          date,
        },
      })
      setHabitsInfo(response.data)
      setCompletedHabits(response.data.completedHabits)
    } catch (error) {
      console.log(error)
      Alert.alert('Ops!', 'Nao foi possível carregar os hábitos do dia')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleHabit(habitId: string) {
    try {
      await api.patch(`/habits/${habitId}/toggle`)
      if (completedHabits.includes(habitId)) {
        setCompletedHabits((prevState) =>
          prevState.filter((habit) => habit !== habitId),
        )
      } else {
        setCompletedHabits((prevState) => [...prevState, habitId])
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Ops', 'Nao foi possível atualizar o status do hábito')
    }
  }

  useEffect(() => {
    getDayHabits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />
        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>
        <Text className="text-zinc-200 font-semibold text-3xl">
          {dayAndMonth}
        </Text>
        <ProgressBar progress={completedPercentage} />

        <View
          className={clsx('mt-6', {
            'opacity-50': isDateInPast,
          })}
        >
          {habitsInfo?.possibleHabits ? (
            habitsInfo?.possibleHabits.map((habit) => {
              return (
                <CheckBox
                  key={habit.id}
                  title={habit.title}
                  checked={completedHabits.includes(habit.id)}
                  disabled={isDateInPast}
                  onPress={() => {
                    handleToggleHabit(habit.id)
                  }}
                />
              )
            })
          ) : (
            <EmptyHabits />
          )}
        </View>
        {isDateInPast && (
          <Text className="text-red-300 mt-10 text-center">
            {habitsInfo?.possibleHabits.length === 0
              ? 'Não possui hábitos disponíveis nesta data'
              : 'Não pode editar hábitos numa data passada!'}
          </Text>
        )}
      </ScrollView>
    </View>
  )
}
