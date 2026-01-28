import React from 'react';

const EnterprisePage = () => {
  return (
    <div className="pt-24 pb-16 bg-gray-900 text-white min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-blue-400 font-semibold uppercase tracking-wider">Enterprise</h1>
          <p className="mt-2 text-4xl font-extrabold sm:text-6xl">Scale your Content.</p>
          <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
            High-volume content pipelines for brands that need 50+ videos or photos monthly to drive sales.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-3">Custom Vetting</h3>
            <p className="text-gray-400">We hand-select creators that match your exact brand aesthetic and target market.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Rights Management</h3>
            <p className="text-gray-400">Own all content rights immediately for use in paid ads or social media campaigns.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">Dedicated Support</h3>
            <p className="text-gray-400">A personal account manager to handle your briefs and creator communications.</p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-xl font-bold text-lg transition-all">
            Talk to Enterprise Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage;