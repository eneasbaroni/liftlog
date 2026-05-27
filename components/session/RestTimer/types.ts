export type RestTimerProps = {
  isRunning: boolean
  secondsLeft: number
  initialSeconds?: number
  onStart: (seconds: number, onComplete?: () => void) => void
  onSkip: () => void
  onComplete?: () => void
}
