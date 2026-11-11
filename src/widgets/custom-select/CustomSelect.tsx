import { storefrontTheme } from "@/templates/storefront-theme"
import * as React from "react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


export type selectField = {
    id: number | string,
    label: string,
    value: string,
}

const emptyOptionValue = "__all_options__"

export function CustomSelect({ selectField, setSelectField, items, placeholder, onValueChange, theme }: { theme?: typeof storefrontTheme, selectField?: selectField | string | undefined, setSelectField?: React.Dispatch<React.SetStateAction<selectField | string | undefined>>, items: selectField[], placeholder?: string, onValueChange?: (value: selectField) => void; }) {
    const selectedValue = typeof selectField === "string" ? selectField : selectField?.value

    return (
        <Select value={selectedValue === "" ? emptyOptionValue : selectedValue} onValueChange={(value: string) => {
            const selectedItem = items.find((item) => (item.value || emptyOptionValue) === value);
            if (selectedItem) {
                if (onValueChange) {
                    onValueChange(selectedItem);
                } else {
                    setSelectField?.(selectedItem);
                }
            }
        }}>
            <SelectTrigger data-storefront-theme={theme} className="w-full">
                <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent data-storefront-theme={theme} className="z-[1000]">
                {items.map((item) => (
                    <SelectItem key={item.id} value={item.value || emptyOptionValue}>
                        <div className="flex flex-col">
                            <span>{item.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
