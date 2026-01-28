import React from 'react';

const PricingPage = () => {
  const tiers = [
    { name: 'Starter', price: '₦0', features: ['Unlimited Briefs', 'Pay per Hire', 'Basic Analytics'] },
    { name: 'Growth', price: '₦25,000', features: ['Verified Creators', 'Priority Support', 'Ad Rights'] },
    { name: 'Business', price: 'Custom', features: ['Managed Briefs', 'Dedicated Manager', 'Volume Discounts'] },
  ];

  return (
    <div className="bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-gray-900">Simple Pricing</h2>
        <p className="mt-4 text-xl text-gray-600">Grow your business without breaking the bank.</p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div key={tier.name} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-all">
              <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
              <div className="my-6">
                <span className="text-5xl font-extrabold">{tier.price}</span>
                {tier.name === 'Growth' && <span className="text-gray-500">/mo</span>}
              </div>
              <ul className="space-y-4 mb-8 text-left flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center text-gray-600">
                    <span className="text-blue-500 mr-3">●</span> {f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                Choose {tier.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;