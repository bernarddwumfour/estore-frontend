import { Accordion as AccordionPrimitive } from "radix-ui";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "What types of furniture do you offer?",
    a: "We offer a full range of modern furniture — chairs, sofas, beds, dining sets, lighting and more, crafted from premium sustainable materials.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua eiusmod tempor incididunt ut labore et dolore magna aliqua",
  },
  {
    q: "Can I track my furniture delivery?",
    a: "Yes — once your order ships you'll receive a tracking link to follow your delivery in real time.",
  },
  {
    q: "What is your return policy?",
    a: "Returns are accepted within 30 days of delivery on unused items in original packaging.",
  },
  {
    q: "What materials are used in your furniture?",
    a: "We use solid hardwoods, premium upholstery fabrics and responsibly sourced metals and finishes.",
  },
  {
    q: "Are there any discounts or promotions available?",
    a: "We run seasonal flash sales and offer 20% off your first order when you subscribe to our newsletter.",
  },
];

export default function Faqs() {
  return (
    <section className="container mx-auto px-4 py-16 lg:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#6b6b5a]">
          <span className="h-px w-6 bg-[#f5b21a]" />
          Faqs
        </span>
        <h2 className="mt-2 text-3xl font-black text-[#2b2b22] md:text-4xl">
          Question? <span className="text-[#3f4d2c]">Look here.</span>
        </h2>
      </div>

      <AccordionPrimitive.Root
        type="single"
        collapsible
        defaultValue="item-1"
        className="mx-auto mt-10 max-w-4xl space-y-4"
      >
        {faqs.map((f, i) => (
          <AccordionPrimitive.Item
            key={f.q}
            value={`item-${i}`}
            className="overflow-hidden rounded-2xl border border-[#e7e1d3] bg-[#f1eee7] data-[state=open]:border-[#3f4d2c] data-[state=open]:bg-[#3f4d2c]"
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger className="group flex flex-1 items-center justify-between gap-4 px-6 py-5 text-left text-base font-bold text-[#2b2b22] outline-none transition-colors data-[state=open]:text-white">
                {f.q}
                <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                  <Plus className="h-5 w-5 text-[#6b6b5a] group-data-[state=open]:hidden" />
                  <Minus className="hidden h-5 w-5 text-[#f5b21a] group-data-[state=open]:block" />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <p className="px-6 pb-5 text-sm leading-relaxed text-[#d6d6c5]">
                {f.a}
              </p>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    </section>
  );
}
