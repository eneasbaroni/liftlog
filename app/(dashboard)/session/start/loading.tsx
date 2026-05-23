const StartSessionLoading = () => {
  return (
    <div className="min-h-screen bg-ll-black-900 flex flex-col items-center justify-center gap-4">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-ll-orange animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-ll-orange animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-ll-orange animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-ll-black-300 text-[11px] uppercase tracking-wider">
        Iniciando sesión...
      </p>
    </div>
  )
}

export default StartSessionLoading
