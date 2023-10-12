import { commitLogs } from "../hooks.server"
import { Utils } from "$lib/utils"
import Students from "$lib/datas/studentList.json"
import type { BirthdaySchedule } from "$lib/types"

const students = structuredClone(Students)

const now = new Date()
const today = now.getDate()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const calendarStruct = (() => {
    const offset = new Date(currentYear, currentMonth - 1, 1).getDay()
    const currentMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    const previousMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate()
    const requiredWeekCount = Math.ceil((currentMonthLastDay + offset) / 7)

    const currentMonthDaysSequence = Utils.generateNumberSequence(currentMonthLastDay)
    const previousMonthDaysSequence = offset > 0 ? Utils.generateNumberSequence(previousMonthLastDay).slice(-offset) : []
    const nextMonthDaysSequence = Utils.generateNumberSequence(requiredWeekCount * 7 - currentMonthDaysSequence.length - previousMonthDaysSequence.length)

    const daysSequence = {
        previousMonth: previousMonthDaysSequence,
        currentMonth: currentMonthDaysSequence,
        nextMonth: nextMonthDaysSequence
    }

    const combinedDaysSequence = [...daysSequence.previousMonth, ...daysSequence.currentMonth, ...daysSequence.nextMonth]

    const birthdaysDict = ((): BirthdaySchedule[][] => {
        const tmpArr = new Array(combinedDaysSequence.length) as BirthdaySchedule[][]

        for (const student of students.filter((student) => student.birthday.month == currentMonth && !/（/.test(student.name))) {
            const index = daysSequence.currentMonth.findIndex((day) => day == student.birthday.day)
            const birthday: BirthdaySchedule = {
                student: student.name,
                date: student.birthday
            }

            if (index != -1) {
                if (tmpArr[offset + index]) {
                    tmpArr[offset + index].push(birthday)
                } else {
                    tmpArr[offset + index] = [birthday]
                }
            }
        }

        return tmpArr
    })()

    return {
        today,
        currentMonth,
        offset,
        requiredWeekCount,
        daysSequence,
        combinedDaysSequence,
        birthdaysDict
    }
})()

export function load() {
    return {
        commitLogs,
        calendarStruct
    }
}
