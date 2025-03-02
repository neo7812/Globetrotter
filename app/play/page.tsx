"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For animations
import Confetti from "react-confetti";
import Image from "next/image"; // For sad-face animation
import html2canvas from "html2canvas"; // For dynamic image generation
import useSound from "use-sound"; // For sound effects

export default function Play() {
  const [username, setUsername] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(""); // Temporary input value
  const [gameData, setGameData] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10); // Timer state (10 seconds)
  const [timerActive, setTimerActive] = useState(false); // Track timer status
  const shareCardRef = useRef<HTMLDivElement>(null); // Ref for generating dynamic image
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Ref for timer to clear it

  // Simulated list of used usernames (for demo; use backend in production)
  const [usedUsernames, setUsedUsernames] = useState<string[]>([]); // Track used usernames in state
  const [usernameError, setUsernameError] = useState<string | null>(null); // Error message for username

  // Sound effects for fun
  const [playCorrect] = useSound("/sounds/correct.mp3", { volume: 0.5 });
  const [playIncorrect] = useSound("/sounds/incorrect.mp3", { volume: 0.3 });
  const [playEnter] = useSound("/sounds/enter.mp3", { volume: 0.5 });

  useEffect(() => {
    if (username) {
      fetchGameData();
    }
  }, [username]);

  const handleTimeout = useCallback(() => {
    setTimerActive(false); // Stop the timer
    if (timerRef.current) clearInterval(timerRef.current); // Clear timer
    setSelected(null); // Ensure no option is highlighted
    setFeedback("timeout"); // New feedback state for timeout
    setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 })); // Increment incorrect score
    playIncorrect(); // Play sad sound for timeout
  }, [playIncorrect]); // Dependencies: only playIncorrect, as it’s the only external dependency

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeout(); // handleTimeout is used here
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current); // Cleanup on unmount or reset
    };
  }, [timerActive, timeLeft, handleTimeout]); // Added handleTimeout to dependencies

  const fetchGameData = async () => {
    const res = await fetch("/api/destination");
    const data = await res.json();
    setGameData(data);
    setSelected(null);
    setFeedback(null);
    setTimeLeft(10); // Reset timer for new destination
    setTimerActive(true); // Start timer for new question
  };

  const handleStart = () => {
    if (!inputValue.trim()) return;

    // Check if username is unique
    const normalizedInput = inputValue.trim().toLowerCase();
    if (usedUsernames.includes(normalizedInput)) {
      setUsernameError("This username is already taken! Try another.");
      return;
    }

    // Register username, add to used list, and clear error
    setUsername(inputValue);
    setUsedUsernames((prev) => [...prev, normalizedInput]); // Add to tracked usernames
    setUsernameError(null);
    playEnter(); // Play a fun sound on start
  };

  const handleGuess = (guess: string) => {
    if (!timerActive) return; // Prevent guesses after timeout

    setSelected(guess);
    setTimerActive(false); // Stop timer on guess
    if (timerRef.current) clearInterval(timerRef.current); // Clear timer

    if (guess === gameData.correct) {
      setFeedback("correct");
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      playCorrect(); // Play a celebratory sound
    } else {
      setFeedback("incorrect");
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      playIncorrect(); // Play a sad sound
    }
  };

  

  const handleShare = async () => {
    if (!shareCardRef.current) return;

    try {
      // Generate dynamic image with a festive background
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 2,
        backgroundColor: "#f0f8ff", // Light blue background for fun
      });
      const imageUrl = canvas.toDataURL("image/png");

      // Create a blob from the data URL for sharing
      const blob = await (await fetch(imageUrl)).blob();
      const imageFile = new File([blob], `${username}-challenge.png`, {
        type: "image/png",
      });

      // Generate invite link with username and score
      const shareLink = `${
        window.location.origin
      }/play?invitedBy=${encodeURIComponent(
        username ?? ""
      )}&score=${encodeURIComponent(score.correct)}`;

      // Construct WhatsApp share URL with text and fun emoji
      const message = `🎉 Join me on Globetrotter! I scored ${score.correct}. Beat my score: ${shareLink} 🌍`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        message
      )}`;

      // Open WhatsApp in a new tab/window
      window.open(whatsappUrl, "_blank");

      // Optionally, offer to download the image with a fun message
      const downloadLink = document.createElement("a");
      downloadLink.href = imageUrl;
      downloadLink.download = `${username}-globetrotter-challenge.png`;
      downloadLink.click();
    } catch (error) {
      console.error("Error generating or sharing image:", error);
    }
  };

  // Handle invited friend logic
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const invitedBy = urlParams.get("invitedBy");
    const invitedScore = urlParams.get("score");
  
    if (invitedBy && invitedScore) {
      setUsername(null);
      playCorrect(); // Play a fun sound for the challenge
      alert(
        `🌟 Challenge from ${invitedBy}! They scored ${invitedScore}. Can you beat it? 🌍`
      );
    }
  }, [playCorrect]); // Added playCorrect to dependencies

  if (!username) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-400 to-green relative">
        {/* Background Earth emoji */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 z-0"
          animate={{ rotate: 360 }} // Enhanced rotation
          transition={{
            duration: 50,
            ease: "linear",
            repeat: Infinity,
          }}
          style={{
            transformOrigin: "center",
            fontSize: "500px", // Large Earth emoji
            color: "rgba(0, 119, 255)", // Light blue, semi-transparent
            zIndex: 0, // Behind all content
          }}
        >
          🌍
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-6 text-white-600 z-10"
        >
          Welcome to Globetrotter Challenge! 🌍
        </motion.h1>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="p-4 border-3 border-blue-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg placeholder-white-600 z-10"
          placeholder="Enter your username"
        />
        {usernameError && (
          <p className="mt-2 text-red-500 text-lg font-semibold z-10">
            {usernameError}
          </p>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStart}
          disabled={!inputValue.trim()}
          className="mt-6 p-3 bg-blue-500 text-black rounded-lg shadow-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200 text-lg z-10"
        >
          Start Your Journey! 🚀
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-400 to-white relative">
      <motion.div
        style={{
          color: "rgba(0, 119, 255)", // Light blue, semi-transparent
        }}
      ></motion.div>

      {/* Hidden share card for dynamic image generation */}
      <div
        ref={shareCardRef}
        style={{
          position: "absolute",
          top: "-9999px",
          width: "1200px",
          height: "630px",
        }}
        className="flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 text-center rounded-lg shadow-2xl z-10"
      >
        <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
          Globetrotter Challenge
        </h1>
        <p className="text-3xl font-semibold">
          {username} scored {score.correct}!
        </p>
        <p className="text-xl mt-3 text-white drop-shadow-md">
          Join the adventure and beat my score! 🌍
        </p>
      </div>

      {gameData ? (
        <>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-extrabold mb-8 text-blue-800 drop-shadow-md z-10"
          >
            Globetrotter Challenge🌍
            - {username} 
          </motion.h1>
          <div className="mb-8 text-center text-black bg-white p-6 rounded-lg shadow-lg max-w-2xl z-10">
            <p className="text-2xl text-blue-700 mb-4">
              Time Left: {timeLeft}s
            </p>
            {gameData.clues.map((clue: string, i: number) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="text-2xl mb-4 text-blue-700"
              >
                {clue}
              </motion.p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8 z-10">
            {gameData.options.map((option: string) => (
              <motion.button
                key={option}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGuess(option)}
                disabled={!!selected || !timerActive}
                className={`p-6 rounded-xl text-white text-xl font-semibold ${
                  selected === option
                    ? option === gameData.correct
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200`}
              >
                {option}
              </motion.button>
            ))}
          </div>
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 text-center bg-white p-6 rounded-xl shadow-xl max-w-2xl z-10"
              >
                {feedback === "correct" && (
                  <>
                    <Confetti
                      width={window.innerWidth}
                      height={window.innerHeight}
                      numberOfPieces={300}
                      recycle={false}
                      colors={[
                        "#FF6B6B",
                        "#4ECDC4",
                        "#45B7D1",
                        "#96CEB4",
                        "#FFEEAD",
                      ]}
                    />
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 text-2xl font-bold text-green-600"
                    >
                      Nice one! You got it right! 🎉
                    </motion.p>
                    <p className="text-xl text-green-500 mt-2">
                      Fun Fact: {gameData.funFact}
                    </p>
                    <p className="text-xl text-green-500 mt-2">
                      Trivia: {gameData.trivia || "No trivia available"}
                    </p>
                  </>
                )}
                {feedback === "incorrect" && (
                  <>
                    <motion.div
                      initial={{ x: 0 }}
                      animate={{
                        x: [0, -15, 15, -15, 15, 0], // Enhanced shake
                        rotate: [0, -5, 5, -5, 5, 0], // Add slight rotation
                        transition: {
                          duration: 0.6,
                          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                          ease: "easeInOut",
                          repeat: 1,
                        },
                      }}
                      className="text-red-600"
                    >
                      <Image
                        src="/sad-face.png"
                        alt="Sad Face"
                        width={60}
                        height={60}
                        className="mx-auto mb-4"
                      />
                    </motion.div>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-red-600"
                    >
                      Oops! Try again. 😢
                    </motion.p>
                    <p className="text-xl text-red-500 mt-2">
                      Fun Fact: {gameData.funFact}
                    </p>
                    <p className="text-xl text-red-500 mt-2">
                      Trivia: {gameData.trivia || "No trivia available"}
                    </p>
                  </>
                )}
                {feedback === "timeout" && (
                  <>
                    <motion.div
                      initial={{ x: 0 }}
                      animate={{
                        x: [0, -15, 15, -15, 15, 0], // Enhanced shake for timeout
                        rotate: [0, -5, 5, -5, 5, 0], // Add slight rotation
                        transition: {
                          duration: 0.6,
                          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                          ease: "easeInOut",
                          repeat: 1,
                        },
                      }}
                      className="text-red-600"
                    >
                      <Image
                        src="/sad-face.png"
                        alt="Sad Face"
                        width={60}
                        height={60}
                        className="mx-auto mb-4"
                      />
                    </motion.div>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-red-600"
                    >
                      Time’s up! The correct answer was {gameData.correct}. 😢
                    </motion.p>
                    <p className="text-xl text-red-500 mt-2">
                      Fun Fact: {gameData.funFact}
                    </p>
                    <p className="text-xl text-red-500 mt-2">
                      Trivia: {gameData.trivia || "No trivia available"}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-8 flex gap-6 z-10">
            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchGameData}
              className="p-3 bg-green-500 text-white rounded-xl text-xl font-semibold hover:bg-green-600 transition-all duration-200"
            >
              Next Destination 🌟
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-3 bg-purple-500 text-white rounded-xl text-xl font-semibold hover:bg-purple-600 transition-all duration-200"
            >
              Challenge a Friend 🚀
            </motion.button>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-2xl font-bold text-blue-800 drop-shadow-md z-10"
          >
            Score: Correct: {score.correct} | Incorrect: {score.incorrect} 🏆
          </motion.p>
        </>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl text-blue-600 z-10"
        >
          Loading your adventure... 🌍
        </motion.p>
      )}
    </div>
  );
}
