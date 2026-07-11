// Thin route shell: the homepage composition comes from the active store
// template (selected by NEXT_PUBLIC_STORE). Data/routing stay here; look lives
// in src/templates/<store>/HomePage.tsx.
import { T } from "@/templates/registry";

export default function Home() {
  return <T.HomePage />;
}
