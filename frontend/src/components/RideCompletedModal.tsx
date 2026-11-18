import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, CheckCircle2, Receipt, Sparkles } from 'lucide-react';
import { Ride } from '../types';

interface RideCompletedModalProps {
  ride: Ride;
  onSubmitRating: (rating: number, feedback: string) => void;
  onClose: () => void;
}

export const RideCompletedModal: React.FC<RideCompletedModalProps> = ({
  ride,
  onSubmitRating,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('Smooth Driving');

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899'],
    });
  }, []);

  const tags = ['Smooth Driving', 'Clean Vehicle', 'Great Route', 'Polite Driver', 'Comfortable'];

  const handleSubmit = () => {
    const fullFeedback = feedback ? `${selectedTag} • ${feedback}` : selectedTag;
    onSubmitRating(rating, fullFeedback);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Arrived at Destination!</h2>
          <p className="text-xs text-slate-400">
            Thank you for riding with MetroCab Demo. Hope you had a pleasant journey!
          </p>
        </div>

        {/* Demo Receipt */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Receipt className="w-3.5 h-3.5 text-amber-400" /> Demo Trip Receipt
            </span>
            <span className="font-mono text-[11px]">#{ride.id.slice(0, 8)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Distance ({ride.distance_km} km)</span>
            <span>${(ride.fare * 0.7).toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Base Fare & Platform Fee</span>
            <span>${(ride.fare * 0.3).toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-sm font-bold text-white">Total Amount Paid</div>
              <div className="text-[11px] text-slate-400">{ride.payment_method}</div>
            </div>
            <div className="text-xl font-extrabold text-amber-400">${ride.fare.toFixed(2)}</div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="text-center space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Rate your driver ({ride.driver?.name || 'Demo Driver'})
          </label>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Compliment Tags */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-slate-400">Add a compliment:</div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  selectedTag === tag
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Feedback Input */}
        <div>
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional comment (e.g. Great music!)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl transition flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Rating & Done</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
