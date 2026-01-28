import React from 'react';

const SolutionsPage = () => {
  const solutions = [
    {
      title: "For Business Growth",
      description: "Get high-quality, authentic content that speaks to your audience and drives conversions.",
      features: ["UGC Video Ads", "Product Photography", "Brand Storytelling", "Social Media Takeovers"],
      icon: "📈"
    },
    {
      title: "For Micro-Creators",
      description: "Monetize your creativity by helping brands tell their stories while building your portfolio.",
      features: ["Fair Compensation", "Brand Partnerships", "Creative Freedom", "Skill Development"],
      icon: "🎨"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Solutions for <span className="text-blue-600">Mutual Growth</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            MyCreator connects businesses looking for sales with creators looking for opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((item, idx) => (
            <div key={idx} className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h2>
              <p className="text-gray-600 mb-6">{item.description}</p>
              <ul className="space-y-3">
                {item.features.map((feat, i) => (
                  <li key={i} className="flex items-center text-gray-700">
                    <span className="text-blue-500 mr-2">✓</span> {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage;