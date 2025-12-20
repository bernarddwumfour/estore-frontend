"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type selectField = {
  id: number
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

interface CustomMultiSelectProps {
  selectField: selectField[]
  setSelectField: React.Dispatch<React.SetStateAction<selectField[]>>
  items: selectField[]
  placeholder?: string
  maxCount?: number
  className?: string
  disabled?: boolean
  allowMultiple?: boolean // NEW PROP
}

export function CustomMultiSelect({
  selectField,
  setSelectField,
  items,
  placeholder = "Select items",
  maxCount = 3,
  className,
  disabled = false,
  allowMultiple = true, // default true
}: CustomMultiSelectProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  const toggleOption = (item: selectField) => {
    if (!allowMultiple) {
      setSelectField([item])
      setIsPopoverOpen(false)
    } else {
      const exists = selectField.some((i) => i.value === item.value)
      const newSelected = exists
        ? selectField.filter((i) => i.value !== item.value)
        : [...selectField, item]
      setSelectField(newSelected)
    }
  }

  const handleClear = () => setSelectField([])
  const clearExtraOptions = () => setSelectField(selectField.slice(0, maxCount))

  const toggleAll = () => {
    if (!allowMultiple) return
    if (selectField.length === items.length) {
      handleClear()
    } else {
      setSelectField(items)
    }
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setIsPopoverOpen((prev) => !prev)}
          disabled={disabled}
          className={cn(
            "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&[data-state=open]>svg]:rotate-180",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
          variant="outline"
        >
          {selectField.length > 0 ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-wrap items-center">
                {selectField.slice(0, maxCount).map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Badge key={item.value} className="m-1 bg-primary/10 text-primary hover:bg-primary/30" variant="secondary">
                      {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                      {item.label}
                      {allowMultiple && (
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleOption(item)
                          }}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </button>
                      )}
                    </Badge>
                  )
                })}
                {allowMultiple && selectField.length > maxCount && (
                  <Badge
                    className="m-1 bg-transparent text-foreground border-foreground/1 hover:bg-transparent"
                    variant="secondary"
                  >
                    {`+ ${selectField.length - maxCount} more`}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearExtraOptions()
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="ml-2 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleClear()
                  }}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
                <Separator orientation="vertical" className="flex min-h-6 h-full" />
                <ChevronDown className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground transition-transform duration-200" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full mx-auto">
              <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
              <ChevronDown className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground transition-transform duration-200" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {allowMultiple && (
                <CommandItem key="all" onSelect={toggleAll} className="cursor-pointer">
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectField.length === items.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible",
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <span>(Select All)</span>
                </CommandItem>
              )}
              {items.map((item) => {
                const isSelected = selectField.some((i) => i.value === item.value)
                return (
                  <CommandItem
                    key={item.value}
                    onSelect={() => toggleOption(item)}
                    className="cursor-pointer"
                  >
                    {allowMultiple && (
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    {item.icon && <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{item.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
