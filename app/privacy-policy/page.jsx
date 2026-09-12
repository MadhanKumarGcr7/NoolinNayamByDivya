import SectionHeading from '@/components/ui/SectionHeading';

export const metadata = {
  title: 'Privacy Policy — Noolin Nayam by Divya',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-28 pb-6 bg-ivory">
      <div className="editorial-container">
        <SectionHeading
          label="Legal"
          headline="Privacy Policy"
          as="h1"
          headlineClassName="text-display-md mb-8"
        />
        <div className="prose prose-stone text-body-sm text-charcoal-600 font-light leading-relaxed space-y-6">
          <p>Last updated: August 2026</p>
          <p>
            At <strong>Noolin Nayam by Divya</strong>, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Noolin Nayam by Divya and how we use it.
          </p>
          <h2 className="font-serif text-xl text-charcoal font-normal pt-4">Information We Collect</h2>
          <p>
            When you place an order, register for a custom order inquiry, or subscribe to our newsletter, we collect personal information provided by you, such as your name, email address, phone number, and shipping address.
          </p>
          <h2 className="font-serif text-xl text-charcoal font-normal pt-4">How We Use Your Information</h2>
          <p>We use the information we collect to process orders, communicate regarding custom sizing, send shipping updates, and improve our handcrafted atelier services.</p>
        </div>
      </div>
    </div>
  );
}
