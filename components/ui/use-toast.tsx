"use client"

import Toast from "react-native-toast-message"

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive" | "success" | "info" | "warning"
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastOptions) => {
    let type: "success" | "error" | "info" | "warning" | "default" = "default"
    switch (variant) {
      case "destructive":
        type = "error"
        break
      case "success":
        type = "success"
        break
      case "info":
        type = "info"
        break
      case "warning":
        type = "warning"
        break
      default:
        type = "default"
        break
    }

    Toast.show({
      type: type,
      text1: title,
      text2: description,
      position: "top", // or 'bottom'
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    })
  }

  return { toast }
}
