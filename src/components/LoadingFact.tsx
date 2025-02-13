import React, { useEffect, useState } from 'react';

export const LoadingFact = () => {
  const [funFact, setFunFact] = useState<string>("");

  useEffect(() => {
    const funFacts = [
      "The first computer virus was created in 1983.",
      "The first 1GB hard drive was announced in 1980, which weighed over 500 pounds.",
      "The first computer programmer was Ada Lovelace in the 1800s.",
      "The first high-level programming language was Fortran, developed in the 1950s.",
      "The first computer mouse was made of wood.",
      "The term 'bug' in programming was coined after an actual bug (a moth) was found in a computer.",
      "The first website ever created is still online.",
      "The first email was sent by Ray Tomlinson to himself in 1971.",
      "The first video game ever created was 'Tennis for Two' in 1958.",
      "The first computer game was created in 1961 and was called 'Spacewar!'."
    ];

    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    setFunFact(randomFact);
  }, []);

  return (
    <div className="text-gray-500 text-base">
      Please wait while I prepare your answer. For now, here's a fun fact: {funFact}
    </div>
  );
};