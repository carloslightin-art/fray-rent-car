import { useEffect, useState } from 'react'

const isStandaloneDisplay = () => {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.navigator?.standalone === true
  )
}

const isSmallViewport = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(max-width: 767px)').matches ?? window.innerWidth < 768
}

function useMobileAppMode() {
  const [isMobileAppMode, setIsMobileAppMode] = useState(false)

  useEffect(() => {
    const update = () => {
      const params = new URLSearchParams(window.location.search)
      const forceDesktop = params.get('desktop') === '1'
      // Carlos revisa la web desde navegador móvil/in-app browser; debe ver la
      // experiencia tipo app aunque no esté instalada como PWA.
      setIsMobileAppMode(isSmallViewport() && !forceDesktop)
    }

    update()
    const viewportQuery = window.matchMedia?.('(max-width: 767px)')
    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)')
    const fullscreenQuery = window.matchMedia?.('(display-mode: fullscreen)')

    viewportQuery?.addEventListener?.('change', update)
    standaloneQuery?.addEventListener?.('change', update)
    fullscreenQuery?.addEventListener?.('change', update)
    window.addEventListener('resize', update)

    return () => {
      viewportQuery?.removeEventListener?.('change', update)
      standaloneQuery?.removeEventListener?.('change', update)
      fullscreenQuery?.removeEventListener?.('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return isMobileAppMode
}

export default useMobileAppMode
