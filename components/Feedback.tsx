import React, { useState } from 'react';
import { ThumbsUpIcon, ThumbsDownIcon } from './Icons';

export const Feedback: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  // In a real application, this function would send the feedback data
  // to an analytics service or a backend database for analysis.
  const handleSubmit = (feedback: 'good' | 'bad') => {
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-8 text-center p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl max-w-lg mx-auto animate-fade-in">
        <p className="font-semibold">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white/50 rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-lg mx-auto backdrop-blur-sm border border-rose-100 animate-fade-in">
      <p className="text-center font-semibold text-lg text-[#5D504A] mb-4">Was this plan helpful?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleSubmit('good')}
          className="flex items-center gap-2 px-6 py-3 font-bold text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-transform transform hover:scale-105"
          aria-label="Helpful"
        >
          <ThumbsUpIcon />
          Yes
        </button>
        <button
          onClick={() => handleSubmit('bad')}
          className="flex items-center gap-2 px-6 py-3 font-bold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-transform transform hover:scale-105"
          aria-label="Not helpful"
        >
          <ThumbsDownIcon />
          No
        </button>
      </div>
    </div>
  );
};
