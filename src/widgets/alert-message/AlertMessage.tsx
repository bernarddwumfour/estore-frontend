/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function AlertMessage({ variant, message }: { variant: "error" | "success" | "default" | "info", message: string }) {
  return (
    <Alert
      className={`
        ${variant === "error" ? "border-red-400 text-red-400" : ""}
        ${variant === "success" ? "border-green-400 text-green-400" : ""}
        ${variant === "default" ? "border-gray-500 text-gray-500" : ""}
        ${variant === "info" ? "border-blue-400 text-blue-400" : ""}
        w-full
      `}
    >
      {variant === "success" ? (
        <CheckCircle2Icon className="!text-green-400 w-5 h-5" />
      ) : variant === "info" ? (
        <PopcornIcon className="!text-blue-400 w-5 h-5" />
      ) : (
        <AlertCircleIcon className={`${variant === "error" ? "!text-red-400 w-5 h-5" : "!text-gray-500 w-5 h-5"}`} />
      )}
      <AlertTitle
        className={`
          ${variant === "error" ? "text-red-400" : ""}
          ${variant === "success" ? "text-green-400" : ""}
          ${variant === "default" ? "text-gray-500" : ""}
          ${variant === "info" ? "text-blue-400" : ""}
          pt-1 mx-1  text-sm
        `}
      >
        {message}
      </AlertTitle>
    </Alert>
  )
}