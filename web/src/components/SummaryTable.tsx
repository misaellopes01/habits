import { useEffect, useState } from 'react'
import { generateRangeFromYearBeginning } from '../utils/generate-range-from-year-beginning'
import { HabitDay } from './HabitDay'
import { api } from '../lib/axios'
import dayjs from 'dayjs'

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const summaryDates = generateRangeFromYearBeginning()

const minimumSummaDatesSize = 18 * 7 // 18 weeks
const amountOfDaysToFill = minimumSummaDatesSize - summaryDates.length

interface SummaryResponseProps {
  id: string
  date: string
  completed: number
  amount: number
}

export function SummaryTable() {
  const [summary, setSummary] = useState<SummaryResponseProps[]>([])
  useEffect(() => {
    api
      .get<SummaryResponseProps[]>('/summary')
      .then((response) => setSummary(response.data))
  }, [])
  return (
    <main className="w-full flex">
      <div className="grid grid-rows-7 grid-flow-row gap-3 pb-4">
        {weekDays.map((day, index) => {
          return (
            <div
              key={index}
              className="text-zinc-400 text-xl h-10 w-10 flex items-start justify-center font-bold"
            >
              {day}
            </div>
          )
        })}
      </div>
      <div className="grid grid-rows-7 grid-flow-col gap-3 overflow-x-auto pb-2 pr-1 pl-1">
        {summary.length > 0 &&
          summaryDates.map((date) => {
            const dayInSummary = summary.find((day) => {
              return dayjs(date).isSame(day.date, 'day')
            })
            return (
              <HabitDay
                key={date.toDateString()}
                date={date}
                amount={dayInSummary?.amount}
                defaultCompleted={dayInSummary?.completed}
              />
            )
          })}
        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, index) => {
            return (
              <div
                key={index}
                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
              />
            )
          })}
      </div>
    </main>
  )
}
