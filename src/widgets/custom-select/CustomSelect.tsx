import * as React from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


export type selectField = {
    id: number|string,
    label: string,
    value: string,
}


export function CustomSelect({ selectField, setSelectField, items, placeholder,onValueChange }: { selectField?: selectField | string | undefined, setSelectField?: React.Dispatch<React.SetStateAction<selectField | string | undefined>>, items: selectField[], placeholder?: string,onValueChange?: (value: selectField) => void; }) {

    return (
        <Select value={(selectField as selectField)?.value} onValueChange={(value: string) => {
            const selectedItem = items.find((item) => item?.value === value);
            if (selectedItem) {
              if (onValueChange) {
                onValueChange(selectedItem);
              } else {
                setSelectField && setSelectField(selectedItem);
              }
            }
          }}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => (
                    <SelectItem key={item.id} value={item.value}>
                        <div className="flex flex-col">
                            <span>{item.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
