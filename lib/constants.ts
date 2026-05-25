export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
] as const

export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  legs: 'Piernas',
  glutes: 'Glúteos',
  core: 'Core',
  cardio: 'Cardio',
}

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export const WEEK_DAY_SHORT_LABELS: Record<WeekDay, string> = {
  monday: 'L',
  tuesday: 'M',
  wednesday: 'X',
  thursday: 'J',
  friday: 'V',
  saturday: 'S',
  sunday: 'D',
}

export const MUSCLE_GROUPS_LABELS_ICONS: Record<MuscleGroup, string> = {
  chest: 'chest.png',
  back: 'back.png',
  shoulders: 'shoulder.png',
  biceps: 'bicep.png',
  triceps: 'bicep.png',
  legs: 'leg.png',
  glutes: 'gluteus.png',
  core: 'core.png',
  cardio: 'cardio.png',
}

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export type WeekDay = (typeof WEEK_DAYS)[number]
