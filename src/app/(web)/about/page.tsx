// Thin route shell: the about page composition comes from the active store
// template (selected by NEXT_PUBLIC_STORE). Look lives in
// src/templates/<store>/AboutPage.tsx.
import { T } from "@/templates/registry";

export default function Page() {
  return <T.AboutPage />;
}
