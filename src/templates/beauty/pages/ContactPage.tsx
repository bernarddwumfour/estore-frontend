import DefaultContactPage from "@/templates/default/pages/ContactPage";
import styles from "../beauty.module.css";

/** The shared contact content, with the beauty template's type and measure. */
export default function ContactPage() {
  return <div className={styles.beautyContact}><DefaultContactPage /></div>;
}
