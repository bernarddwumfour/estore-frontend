import DefaultContactPage from "@/templates/default/pages/ContactPage";
import styles from "../tyrepapa.module.css";

/** The shared contact content, with the tyrepapa template's type and measure. */
export default function ContactPage() {
  return <div className={styles.tyrepapaContact}><DefaultContactPage /></div>;
}
