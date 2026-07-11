// Thin route shell: the contact page composition comes from the active store
// template (selected by NEXT_PUBLIC_STORE). Look lives in
// src/templates/<store>/ContactPage.tsx.
import { T } from "@/templates/registry";

export default function Page() {
  return <T.ContactPage />;
}
