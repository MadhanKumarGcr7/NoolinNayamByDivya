import FAQSection from '@/components/sections/FAQSection';
import { brandConfig } from '@/lib/config';

export const metadata = {
  title: `Frequently Asked Questions — ${brandConfig.displayName}`,
  description: 'Everything you need to know about our handcrafted crochet products, custom sizing, WhatsApp ordering, delivery, and care.',
};

export default function FAQPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      <FAQSection showHeader={true} title="Frequently Asked Questions" />
    </div>
  );
}
