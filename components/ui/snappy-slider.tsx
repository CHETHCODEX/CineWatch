"use client"

import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CustomSliderProps {
    values: number[]
    defaultValue: number
    value?: number
    resetKey?: number
    snapping?: boolean
    min?: number
    max?: number
    step?: number
    onChange: (value: number) => void
    config?: {
        snappingThreshold?: number
        labelFormatter?: (value: number) => string
    }
    label: string
    prefix?: string
    suffix?: string
    className?: string
}

const formatNumber = (value: number, step: number = 1): string => {
    // Attempt to convert to number if it isn't already
    const numValue = Number(value)
    
    // Throw error if conversion results in NaN
    if (isNaN(numValue)) {
        throw new Error(`Invalid number value: ${value}`)
    }

    const decimalPlaces = step.toString().split('.')[1]?.length || 0
    if (decimalPlaces === 0 && Number.isInteger(numValue)) {
        return numValue.toString()
    }
    return numValue.toFixed(decimalPlaces)
}

/**
 * SnappySlider is a highly interactive range input component that combines precise value control
 * with intuitive visual feedback. It features:
 * 
 * - Snap-to points for accurate value selection
 * - Visual markers for predefined values
 * - Direct numeric input with keyboard controls
 * - Touch and mouse drag support
 * - Customizable step sizes and ranges
 * - Out-of-bounds value indication
 * - Double-click to reset functionality
 * - Prefix/suffix label support
 */
const SnappySlider = React.forwardRef<
    HTMLDivElement,
    CustomSliderProps
>(({ 
    values, 
    defaultValue,
    value,
    resetKey,
    snapping = true,
    min: providedMin,
    max: providedMax,
    step,
    onChange,
    config = {},
    label,
    prefix,
    suffix,
    className,
    ...props 
}, ref) => {
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const { snappingThreshold = 1, labelFormatter } = config

    const defaultValueArray = [...values, defaultValue].sort((a, b) => a - b)
    
    // Calculate input bounds using defaultValueArray
    const inputMin = providedMin ?? Math.min(...defaultValueArray)
    const inputMax = providedMax ?? Math.max(...defaultValueArray)
    
    // Filter values to only those within input range (if min/max provided)
    const sliderValues = providedMin !== undefined && providedMax !== undefined
        ? defaultValueArray.filter(v => v >= providedMin && v <= providedMax)
        : defaultValueArray

    // Calculate slider visual bounds from filtered values
    const sliderMin = Math.min(...sliderValues)
    const sliderMax = Math.max(...sliderValues)
    
    const computedStep = step ?? (label.includes("Duration") ? 1 : 0.1)

    // Track both controlled and internal state
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value ?? internalValue

    // Update input display value
    const [inputValue, setInputValue] = React.useState(formatNumber(currentValue, computedStep))

    // Check if value is outside slider bounds
    const isOutOfBounds = currentValue < sliderMin || currentValue > sliderMax

    // Calculate percentage for slider position (clamped to slider range)
    const sliderPercentage = ((Math.min(Math.max(currentValue, sliderMin), sliderMax) - sliderMin) / (sliderMax - sliderMin)) * 100

    // Update internal state when controlled value changes
    React.useEffect(() => {
        if (value !== undefined) {
            setInternalValue(value)
            setInputValue(formatNumber(value, computedStep))
        }
    }, [value, computedStep])

    const handleValueChange = (newValue: number) => {
        setInternalValue(newValue)
        setInputValue(formatNumber(newValue, computedStep))
        onChange(newValue)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleInputBlur = () => {
        const newValue = Number(inputValue)

        if (isNaN(newValue)) {
            setInputValue(formatNumber(currentValue, computedStep))
        } else {
            // Clamp to input range (which might be wider than slider range)
            const clampedValue = Math.max(inputMin, Math.min(inputMax, newValue))
            const steppedValue = Math.round(clampedValue / computedStep) * computedStep
            setInputValue(formatNumber(steppedValue, computedStep))
            handleValueChange(steppedValue)
        }
    }

    // Update slider interaction logic
    const handleInteraction = React.useCallback((clientX: number) => {
        const slider = sliderRef.current
        if (!slider) return

        const rect = slider.getBoundingClientRect()
        const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const rawValue = percentage * (sliderMax - sliderMin) + sliderMin

        if (snapping) {
            // Use defaultValueArray for snap points instead of values
            const snapPoints = [...new Set([...defaultValueArray, currentValue])].sort((a, b) => a - b)
            const closestValue = snapPoints.reduce((prev, curr) => {
                return Math.abs(curr - rawValue) < Math.abs(prev - rawValue) ? curr : prev
            })
            
            if (Math.abs(closestValue - rawValue) <= snappingThreshold) {
                handleValueChange(closestValue)
                return
            }
        }

        const steppedValue = Math.round(rawValue / computedStep) * computedStep
        const clampedValue = Math.max(sliderMin, Math.min(sliderMax, steppedValue))
        handleValueChange(clampedValue)
    }, [sliderMin, sliderMax, defaultValueArray, currentValue, computedStep, snapping, snappingThreshold])

    React.useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return

        const handleMouseDown = (e: MouseEvent) => {
            // Prevent text selection while dragging
            e.preventDefault()
            handleInteraction(e.clientX)

            // Add selection prevention to document during drag
            document.body.style.userSelect = 'none'

            const handleMouseMove = (e: MouseEvent) => {
                handleInteraction(e.clientX)
            }

            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                // Restore text selection when done dragging
                document.body.style.userSelect = ''
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp, { once: true })
        }

        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault()
            handleInteraction(e.touches[0].clientX)

            const handleTouchMove = (e: TouchEvent) => {
                handleInteraction(e.touches[0].clientX)
            }

            document.addEventListener('touchmove', handleTouchMove, { passive: false })
            document.addEventListener('touchend', () => {
                document.removeEventListener('touchmove', handleTouchMove)
            }, { once: true })
        }

        slider.addEventListener('mousedown', handleMouseDown)
        slider.addEventListener('touchstart', handleTouchStart, { passive: false })

        return () => {
            slider.removeEventListener('mousedown', handleMouseDown)
            slider.removeEventListener('touchstart', handleTouchStart)
            // Ensure we clean up the user-select style if component unmounts during drag
            document.body.style.userSelect = ''
        }
    }, [sliderMin, sliderMax, onChange, values, defaultValue, label, computedStep, snapping, snappingThreshold, handleInteraction])

    React.useEffect(() => {
        const slider = sliderRef.current
        if (!slider) return

        const handleDoubleClick = () => {
            onChange(defaultValue)
        }

        slider.addEventListener('dblclick', handleDoubleClick)
        return () => slider.removeEventListener('dblclick', handleDoubleClick)
    }, [onChange, defaultValue])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault()
            const currentValue = Number(inputValue)
            if (isNaN(currentValue)) return

            const newValue = currentValue + (e.key === 'ArrowUp' ? computedStep : -computedStep)
            const clampedValue = Math.max(sliderMin, Math.min(sliderMax, newValue))

            // Update both the input value and trigger the onChange
            setInputValue(formatNumber(clampedValue, computedStep))
            onChange(clampedValue)
        }
    }

    return (
        <div 
            ref={ref}
            className={cn(
                "[--mark-slider-gap:0.25rem] [--mark-slider-height:0.5rem] [--mark-slider-track-height:0.375rem] [--mark-slider-marker-width:1px]",
                "flex flex-col gap-[--mark-slider-gap] pb-7", 
                className
            )} 
            {...props}
        >
            <SnappySliderHeader>
                <SnappySliderLabel>{label}</SnappySliderLabel>
                <SnappySliderValue
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    prefix={prefix}
                    suffix={suffix}
                    className={cn(isOutOfBounds && "opacity-75")}
                />
            </SnappySliderHeader>
            <div className="relative h-[--mark-slider-height]">
                <div ref={sliderRef} className="absolute inset-0">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-[--mark-slider-track-height] bg-primary/10 rounded-sm overflow-hidden">
                        {/* Progress overlay */}
                        <div
                            className={cn(
                                "absolute top-0 h-full z-[1] bg-primary"
                            )}
                            style={{ width: `${sliderPercentage}%` }}
                        />
                        
                        {/* Regular marks */}
                        {sliderValues.map((mark, index) => {
                            if (mark === 0) return null;
                            const markPercentage = ((mark - sliderMin) / (sliderMax - sliderMin)) * 100
                            if (markPercentage < 0 || markPercentage > 100) return null
                            return (
                                <div
                                    key={`${mark}-${index}`}
                                    className={cn(
                                        "absolute top-0 w-[--mark-slider-marker-width] z-[2] h-full -translate-x-[calc(var(--mark-slider-marker-width)/2)]",
                                        "bg-white/90 dark:bg-black/90"
                                    )}
                                    style={{ left: `${markPercentage}%` }}
                                />
                            )
                        })}
                    </div>

                    {/* Zero marker */}
                    {sliderValues.includes(0) && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 z-20"
                            style={{ left: `${((0 - sliderMin) / (sliderMax - sliderMin)) * 100}%` }}
                        >
                            <div className="h-3 w-[--mark-slider-marker-width] bg-red-600 -translate-x-[calc(var(--mark-slider-marker-width)/2)]" />
                        </div>
                    )}

                    {/* Thumb */}
                    <div
                        className={cn(
                            "absolute z-30 top-1/2 -translate-y-[35%] -translate-x-1/2 cursor-grab active:cursor-grabbing",
                            isOutOfBounds && "opacity-75"
                        )}
                        style={{ left: `${sliderPercentage}%` }}
                    >
                        {/* Triangle */}
                        <div className={cn(
                            "w-0 h-0 border-[5px] border-transparent border-b-primary mt-2",
                            isOutOfBounds && "border-b-primary/20"
                        )} />
                        {/* Square */}
                        <div className={cn(
                            "w-[10px] h-[10px]",
                            isOutOfBounds ? "bg-primary/20" : "bg-primary"
                        )} />
                        {/* Text */}
                        <div className="absolute top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <span className={cn(
                                "text-xs font-medium",
                                isOutOfBounds && "opacity-75"
                            )}>
                                {isOutOfBounds 
                                    ? currentValue < sliderMin 
                                        ? `<${formatNumber(sliderMin, computedStep)}`
                                        : `>${formatNumber(sliderMax, computedStep)}`
                                    : formatNumber(currentValue, computedStep)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
SnappySlider.displayName = "SnappySlider"

const SnappySliderHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex justify-between items-center mb-0.5", className)}
        {...props}
    />
))
SnappySliderHeader.displayName = "SnappySliderHeader"

const SnappySliderLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn("text-xs font-medium text-primary/50", className)}
        {...props}
    />
))
SnappySliderLabel.displayName = "SnappySliderLabel"

const SnappySliderValue = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { 
        prefix?: string
        suffix?: string
    }
>(({ className, prefix, suffix, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleContainerClick = () => {
        inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget
        const value = parseFloat(input.value)
        
        switch (e.key) {
            case 'Enter':
                input.blur()
                break
            case 'ArrowUp':
                e.preventDefault()
                if (!isNaN(value)) {
                    const step = e.shiftKey ? 10 : 1
                    input.value = String(value + step)
                    input.dispatchEvent(new Event('change', { bubbles: true }))
                }
                break
            case 'ArrowDown':
                e.preventDefault()
                if (!isNaN(value)) {
                    const step = e.shiftKey ? 10 : 1
                    input.value = String(value - step)
                    input.dispatchEvent(new Event('change', { bubbles: true }))
                }
                break
        }
    }

    return (
        <div 
            className="group inline-flex items-center bg-primary/5 rounded px-0.5 focus-within:ring-1 focus-within:ring-primary cursor-text w-20"
            onClick={handleContainerClick}
        >
            {prefix && <span className="text-xs text-primary/75 select-none shrink-0">{prefix}</span>}
            <input
                ref={(node) => {
                    if (typeof ref === 'function') ref(node)
                    else if (ref) ref.current = node
                    inputRef.current = node
                }}
                type="number"
                inputMode="decimal"
                onKeyDown={handleKeyDown}
                className={cn(
                    "w-full min-w-0 text-right text-xs bg-transparent border-none focus:outline-none",
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    "tabular-nums text-primary",
                    className
                )}
                {...props}
            />
            {suffix && <span className="text-xs text-primary/75 select-none shrink-0">{suffix}</span>}
        </div>
    )
})
SnappySliderValue.displayName = "SnappySliderValue"

export { SnappySlider }
