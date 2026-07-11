// Thin route shell: the blog listing composition comes from the active store
// template (selected by NEXT_PUBLIC_STORE). Look lives in
// src/templates/<store>/BlogPage.tsx.
import { T } from "@/templates/registry";

export default function Page() {
  return <T.BlogPage />;
}
