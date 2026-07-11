// Furniture store contact page — matches the furniture theme (cream header
// band, green form accents, gold icon chips). Contact details mirror the
// furniture footer.
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import PageHeader from "../components/PageHeader";

const details = [
  {
    icon: MapPin,
    title: "Address",
    lines: ["8502 Preston Rd.", "Inglewood, Maine 98380", "United States"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["example@gmail.com", "sales@furniture.com"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+0123-456-789", "+0123-456-780"],
  },
  {
    icon: Clock,
    title: "Working Hours",
    lines: ["Mon – Fri: 9am – 6pm", "Sat: 10am – 4pm"],
  },
];

const inputClass =
  "w-full rounded-xl border border-[#e7e1d3] bg-white px-4 py-3 text-sm text-[#2b2b22] outline-none transition-colors focus:border-[#3f4d2c]";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-[#2b2b22]">
      <PageHeader
        subtitle="Contact Us"
        title="Get In Touch"
        description="Have a question about a product, an order, or a custom piece? Our team is ready to help — reach out any time."
      />

      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-3xl bg-[#f1eee7] p-6 md:p-8">
            <h2 className="text-2xl font-black">Send us a message</h2>
            <form className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
                    Your Name
                  </label>
                  <input id="name" name="name" type="text" required placeholder="John Doe" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
                    Email Address
                  </label>
                  <input id="email" name="email" type="email" required placeholder="john@example.com" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold">
                  Subject
                </label>
                <input id="subject" name="subject" type="text" required placeholder="Order inquiry" className={inputClass} />
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">
                  Message
                </label>
                <textarea id="message" name="message" rows={6} required placeholder="Write your message here..." className={`${inputClass} resize-none`} />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[#3f4d2c] py-3.5 text-sm font-bold text-[#f6f3ec] transition-colors hover:bg-[#33401f]"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-black">Get in touch</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {details.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="rounded-3xl border border-[#e7e1d3] p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5b21a] text-[#22401f]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold">{title}</h3>
                  <div className="mt-1 space-y-0.5 text-sm text-[#6b6b5a]">
                    {lines.map((l) => (
                      <p key={l}>{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="mt-4 flex min-h-56 flex-1 items-center justify-center overflow-hidden rounded-3xl bg-[#f1eee7] text-sm font-medium text-[#a6a08f]">
              Map Placeholder
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
