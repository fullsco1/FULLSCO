import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useMobile() {
  // إعداد قيمة افتراضية للمتصفحات - false لضمان عدم تغيير الحالة من uncontrolled إلى controlled
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // إعداد القيمة الأولية مباشرة
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    mql.addEventListener("change", onChange)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

// Alias for compatibility with existing imports
export const useIsMobile = useMobile
