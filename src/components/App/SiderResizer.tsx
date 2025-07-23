import React, { forwardRef, useEffect, useCallback } from 'react'

interface SiderResizerProps {
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  setSiderWidth: (width: number) => void
}

export const SiderResizer = forwardRef<HTMLDivElement, SiderResizerProps>(
  ({ isDragging, setIsDragging, setSiderWidth }, ref) => {
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
      },
      [setIsDragging]
    )

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging) return

        const newWidth = e.clientX
        if (newWidth >= 200 && newWidth <= 600) {
          setSiderWidth(newWidth)
        }
      },
      [isDragging, setSiderWidth]
    )

    const handleMouseUp = useCallback(() => {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }, [setIsDragging])

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
      <div ref={ref} className="sider-resizer" onMouseDown={handleMouseDown} />
    )
  }
)

SiderResizer.displayName = 'SiderResizer'
