import { useEffect, useState } from 'react'

interface HookProps {
  ref: any
  elementClassDontCondition?: string[]
  withListener?: boolean
}

const useOutsideClick = ({
  ref,
  elementClassDontCondition = [],
}: HookProps) => {
  const [isClickOutside, setIsClickOutside] = useState(false)

  const isClickOnSomeClassCondition = (element: any): boolean => {
    let isClick = false

    for (let i = 0; i < element.classList.length; i++) {
      if (elementClassDontCondition?.includes(element.classList[i])) {
        isClick = true
        break
      }
    }

    return isClick
  }

  const handleClickOutside = (e: any) => {
    if (
      ref.current &&
      !ref.current.contains(e.target) &&
      !isClickOnSomeClassCondition(e.target)
    ) {
      setIsClickOutside(true)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])

  return {
    isClickOutside,
    setIsClickOutside,
  }
}

export default useOutsideClick