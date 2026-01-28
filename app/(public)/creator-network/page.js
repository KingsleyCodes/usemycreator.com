import React from 'react';

const CreatorNetwork = () => {
  const categories = ['Lifestyle', 'Tech', 'Fashion', 'Food', 'Beauty', 'Gaming'];

  return (
    <div className="min-h-screen bg-white pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-blue-600 font-semibold tracking-wide uppercase">The Network</h2>
        <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-5xl">
          Powered by Real People
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
          We focus on micro-creators who make content that converts, not just influencers with empty numbers.
        </p>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div key={cat} className="py-6 bg-gray-50 rounded-xl border border-gray-100 font-medium text-gray-600">
              {cat}
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 sm:p-16 bg-blue-600 rounded-3xl text-white">
          <h3 className="text-3xl font-bold">Build your portfolio, get paid.</h3>
          <p className="mt-4 text-blue-100">Join thousands of creators helping businesses grow every day.</p>
          <button className="mt-8 bg-white text-blue-600 px-8 py-4 rounded-full font-bold hover:shadow-lg transition">
            Apply to Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorNetwork;