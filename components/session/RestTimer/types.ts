export type RestTimerProps = {
  isRunning: boolean
  secondsLeft: number
  initialSeconds?: number
  onStart: (seconds: number) => void
  onSkip: () => void
}
