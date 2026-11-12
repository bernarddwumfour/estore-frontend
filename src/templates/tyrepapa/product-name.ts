function attributeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function tyreProductName(title: string, attributes?: Record<string, unknown> | null): string {
  const size = attributeText(attributes?.size);
  const name = [attributeText(attributes?.brand), attributeText(attributes?.model)].filter(Boolean).join(" ");
  return [size, name].filter(Boolean).join(" — ") || title;
}
