import { useEffect, useState } from "react";

const facts = [
  "Did you know? The first computer bug was an actual bug - a moth found in the Harvard Mark II computer in 1947.",
  "Fun fact: The term 'debugging' came from removing an actual moth from a computer.",
  "In binary code, a human would need 5.5 million years to count to a trillion.",
  "The first programmer in history was a woman - Ada Lovelace.",
  "JavaScript was created in just 10 days by Brendan Eich in 1995.",
  "There are over 700 different programming languages!",
];

export const LoadingFact = () => {
  const [currentFact, setCurrentFact] = useState(facts[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact(facts[Math.floor(Math.random() * facts.length)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 animate-pulse">{currentFact}</p>
      <div className="h-1 w-full bg-gray-200 rounded">
        <div className="h-1 bg-blue-500 rounded animate-[loading_2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
};