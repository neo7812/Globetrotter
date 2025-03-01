"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

export default function Play() {
  const [username, setUsername] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch game data once username is set
    if (username) {
      fetchGameData();
    }
  }, [username]); // Dependency on username ensures it runs after username is set

  const fetchGameData = async () => {
    const res = await fetch("/api/destination");
    const data = await res.json();
    setGameData(data);
    setSelected(null);
    setFeedback(null);
  };

  const handleGuess = (guess: string) => {
    setSelected(guess);
    if (guess === gameData.correct) {
      setFeedback("correct");
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setFeedback("incorrect");
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const handleShare = async () => {
    const shareLink = `${window.location.origin}/play?invitedBy=${username}&score=${score.correct}`;
    const imageUrl = `/api/share?username=${username}&score=${score.correct}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=Join me on Globetrotter! I scored ${score.correct}. Beat my score: ${shareLink}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!username) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl mb-4">Enter Your Username</h1>
        <input
          type="text"
          onChange={(e) => setUsername(e.target.value)} // Updates username state
          className="p-2 border rounded"
          placeholder="Your unique username"
        />
        <button
          onClick={() => {
            if (username) fetchGameData(); // Trigger fetch only if username exists
          }}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
          disabled={!username} // Disable button until username is entered
        >
          Start Playing
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      {gameData ? (
        <>
          <h1 className="text-4xl font-bold mb-6">Globetrotter Challenge</h1>
          <div className="mb-6 text-center">
            {gameData.clues.map((clue: string, i: number) => (
              <p key={i} className="text-xl">{clue}</p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {gameData.options.map((option: string) => (
              <button
                key={option}
                onClick={() => handleGuess(option)}
                disabled={!!selected}
                className={`p-4 rounded-lg text-white ${
                  selected === option
                    ? option === gameData.correct
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-blue-500 hover:bg-blue-600"
                } disabled:opacity-50`}
              >
                {option}
              </button>
            ))}
          </div>
          {feedback === "correct" && (
            <>
              <Confetti width={window.innerWidth} height={window.innerHeight} />
              <p className="mt-4 text-green-600">Nice one! {gameData.funFact}</p>
            </>
          )}
          {feedback === "incorrect" && (
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 text-red-600"
            >
              Oops! {gameData.funFact}
            </motion.p>
          )}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={fetchGameData}
              className="p-2 bg-green-500 text-white rounded-lg"
            >
              Next Destination
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-purple-500 text-white rounded-lg"
            >
              Challenge a Friend
            </button>
          </div>
          <p className="mt-4">
            Score: Correct: {score.correct} | Incorrect: {score.incorrect}
          </p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}