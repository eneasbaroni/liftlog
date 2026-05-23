import { ExerciseForm } from '@/components'

const NewExercisePage = () => {
  return (
    <div className="min-h-screen bg-ll-black-900 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="w-full text-ll-white text-[28px] leading-none font-anton mobile:text-center">
          NUEVO EJERCICIO
        </h1>
      </div>

      <ExerciseForm />
    </div>
  )
}

export default NewExercisePage
