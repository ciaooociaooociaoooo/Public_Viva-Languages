import { ProgramsType, ProgramType, GroupedProgramsType } from './definitions'

export const deskSize: number = 1024

export const groupProgramsByCategoryAndLanguage = (programs: ProgramsType) => {
  return programs.reduce((acc: GroupedProgramsType, program: ProgramType) => {
    const category = program.category_name
    const language = program?.language_name
    const age_group = program.age_group

    // (age group is kids)
    if (age_group === 'Kids') {
      if (!acc[age_group]) {
        acc[age_group] = []
      }

      ;(acc[age_group] as ProgramsType[]).push(program)
      // (category is event)
    } else if (!language) {
      if (!acc[category]) {
        acc[category] = []
      }

      ;(acc[category] as ProgramsType[]).push(program)
      // (category is course)
    } else {
      if (!acc[category]) {
        acc[category] = {}
      }

      if (!(acc[category] as Record<string, ProgramsType[]>)[language]) {
        ;(acc[category] as Record<string, ProgramsType[]>)[language] = []
      }

      ;(acc[category] as Record<string, ProgramsType[]>)[language].push(program)
    }

    return acc
  }, {})
}

export function formatNumber(value: string | number) {
  return new Intl.NumberFormat('en-US').format(Number(value))
}

// For only closing the top dialog instead of every dialog when pressing Esc key.
let stack: string[] = []

export const pushDialog = (id: string) => {
  stack.push(id)
}

export const popDialog = (id: string) => {
  stack = stack.filter((d) => d !== id)
}

export const isTopDialog = (id: string) => {
  return stack[stack.length - 1] === id
}
