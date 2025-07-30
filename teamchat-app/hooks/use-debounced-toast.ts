"use client"

import { useToast } from "./use-toast"
import { useRef } from "react"

interface DebouncedToastOptions {
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
    duration?: number
}

// Store active toasts to prevent duplicates
const activeToasts = new Map<string, number>()

export function useDebouncedToast() {
    const { toast } = useToast()
    const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

    const debouncedToast = (
        message: string,
        options: DebouncedToastOptions = {},
        debounceKey?: string,
        debounceTime: number = 1000
    ) => {
        // Create a unique key for this toast
        const key = debounceKey || `${message}-${options.variant || 'default'}`

        // Clear existing timeout for this key
        const existingTimeout = timeouts.current.get(key)
        if (existingTimeout) {
            clearTimeout(existingTimeout)
        }

        // Check if this exact toast is already active
        const now = Date.now()
        const lastToastTime = activeToasts.get(key)
        if (lastToastTime && (now - lastToastTime) < 2000) {
            // Skip if same toast was shown less than 2 seconds ago
            return
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            // Mark this toast as active
            activeToasts.set(key, now)

            // Show the toast
            toast({
                title: options.title,
                description: message,
                variant: options.variant || 'default',
                duration: options.duration || 3000,
            })

            // Clean up
            timeouts.current.delete(key)

            // Remove from active toasts after duration
            setTimeout(() => {
                activeToasts.delete(key)
            }, options.duration || 3000)
        }, debounceTime)

        timeouts.current.set(key, timeout)
    }

    const clearAllToasts = () => {
        // Clear all pending timeouts
        timeouts.current.forEach(timeout => clearTimeout(timeout))
        timeouts.current.clear()
        activeToasts.clear()
    }

    return {
        debouncedToast,
        clearAllToasts
    }
}