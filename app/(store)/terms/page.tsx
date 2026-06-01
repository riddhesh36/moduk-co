import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Moduk & Co",
  description: "Welcome to Moduk & Co. Read our Terms & Conditions for ordering, delivery, cancellations, refunds, allergies, and handling of our premium handcrafted modaks.",
};

export default function TermsPage() {
  return (
    <div className="w-full bg-cream min-h-screen py-16 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Title Block */}
        <div className="border-b border-dark/10 pb-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-dark mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm text-text-muted font-dmsans uppercase tracking-wider">
            Last Updated: June 2026
          </p>
        </div>

        {/* Content Block */}
        <div className="space-y-8 font-garamond text-lg md:text-xl text-text-body leading-relaxed">
          
          <p className="italic text-dark">
            Welcome to Moduk & Co. By placing an order through our website, you agree to the following Terms & Conditions.
          </p>

          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              1. Order Acceptance
            </h2>
            <p>
              All orders placed through our website are subject to acceptance and availability. Once an order is confirmed and payment is successfully processed, preparation of your products may begin immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              2. Product Information
            </h2>
            <p>
              We strive to ensure that all product descriptions, images, pricing, and availability are accurate. However, slight variations in appearance, packaging, weight, color, or presentation may occur as our products are handcrafted.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              3. Pricing & Payments
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All prices are displayed in Indian Rupees (INR).</li>
              <li>Payments must be completed before order processing begins.</li>
              <li>We reserve the right to modify prices without prior notice.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              4. Cancellation & Refund Policy
            </h2>
            <p>
              As our products are freshly prepared and made-to-order, ingredients and production resources are allocated immediately upon order confirmation.
            </p>
            <p className="font-semibold text-dark">
              Therefore:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Orders cannot be cancelled once payment has been successfully processed.</li>
              <li>Refunds will not be provided for confirmed orders except in cases where Moduk & Co is unable to fulfill the order.</li>
              <li>In the event that an order cannot be fulfilled due to circumstances on our end, a full refund will be issued to the original payment method.</li>
            </ul>
            <p className="italic">
              This policy helps us maintain product quality and minimize food wastage.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              5. Delivery
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Delivery times are estimates and may vary due to traffic, weather conditions, operational constraints, or unforeseen circumstances.</li>
              <li>Customers are responsible for providing accurate delivery information.</li>
              <li>Moduk & Co shall not be responsible for delays caused by incorrect addresses or unavailable recipients.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              6. Product Handling
            </h2>
            <p>
              Our products are perishable food items and should be consumed within the recommended period after delivery.
            </p>
            <p className="font-semibold text-dark">
              Customers are advised to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Store products according to any provided instructions.</li>
              <li>Consume products before the suggested consumption period.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              7. Allergies & Dietary Information
            </h2>
            <p>
              Our products may contain or come into contact with ingredients such as milk, nuts, coconut, dry fruits, wheat, or other allergens.
            </p>
            <p>
              Customers with food allergies or dietary restrictions should contact us before placing an order.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              8. Intellectual Property
            </h2>
            <p>
              All content on this website, including logos, product images, designs, text, and branding, is the property of Moduk & Co and may not be copied, reproduced, or used without prior written permission.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              9. Limitation of Liability
            </h2>
            <p>
              Moduk & Co shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website, products, or services beyond the value of the order placed.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              10. Privacy
            </h2>
            <p>
              Customer information is collected solely for order processing, delivery, customer support, and communication purposes. We do not sell customer information to third parties.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-2">
            <h2 className="text-xl font-bold font-playfair text-dark">
              11. Changes to Terms
            </h2>
            <p>
              Moduk & Co reserves the right to update or modify these Terms & Conditions at any time without prior notice. Changes become effective upon publication on the website.
            </p>
          </section>

          {/* Section 12 */}
          <section className="space-y-2 pt-4 border-t border-dark/10">
            <h2 className="text-xl font-bold font-playfair text-dark">
              12. Contact Us
            </h2>
            <p>
              For any questions regarding these Terms & Conditions, please contact:
            </p>
            <div className="mt-2 text-dark font-semibold">
              <p>Moduk & Co</p>
              <p>
                Email:{" "}
                <a href="mailto:hello@modukandco.in" className="text-rose hover:underline">
                  hello@modukandco.in
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://modukandco.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose hover:underline"
                >
                  modukandco.in
                </a>
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
