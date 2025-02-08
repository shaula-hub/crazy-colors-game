import React, { useState, useEffect, useCallback } from "react";
// Import for device detection
import { useLayoutEffect } from "react";

// Constants
const COLOR_NAMES = [
  "ЧЁРНЫЙ",
  "БЕЛЫЙ",
  "КРАСНЫЙ",
  "ОРАНЖЕВЫЙ",
  "ЖЁЛТЫЙ",
  "ЗЕЛЁНЫЙ",
  "ГОЛУБОЙ",
  "СИНИЙ",
  "ФИОЛЕТОВЫЙ",
];
const COLOR_CODES = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#FFA500",
  "#FFFF00",
  "#008000",
  "#42AAFF",
  "#0000FF",
  "#8B00FF",
];
const OPTIONS = ["Какого цвета буквы?", "Какого цвета фон?"];

// Game screens enum
const SCREENS = {
  INTRO: "intro",
  SELECTION: "selection",
  MAIN: "main",
};

// Device detection function
const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    isMobile: width <= 768,
    screenWidth: width,
    screenHeight: height,
  };
};

// Game dimensions configuration
const GAME_DIMENSIONS = {
  DESKTOP: {
    width: 600,
    height: 720,
  },
  MOBILE: {
    width: "100%",
    minHeight: 640,
  },
};

const SELECTION_CONFIG = {
  START_Y: {
    DESKTOP: 120,
    MOBILE: 80,
  },
  STRIPE_HEIGHT: {
    DESKTOP: 80,
    MOBILE: 60,
  },
  CHANGE_INTERVAL: 200,
  SELECTION_DURATION: 4000,
  PAUSE_DURATION: 2000,
};

function CrazyColorsGame() {
  // Game state
  const [currentScreen, setCurrentScreen] = useState(SCREENS.INTRO);
  const [gameStats, setGameStats] = useState({
    questionsAll: 0,
    answersCorrect: 0,
    answersWrong: 0,
    timeSpent: 0,
    timePerAnswer: 0,
  });
  const [settings, setSettings] = useState({
    regim: 0,
    optionIndex: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showExit, setShowExit] = useState(false);

  // Selection screen state
  const [selectionIndex, setSelectionIndex] = useState(0);
  const [isSelectionFixed, setIsSelectionFixed] = useState(false);
  const [selectionY, setSelectionY] = useState(SELECTION_CONFIG.START_Y);

  // Main screen state
  const [currentQuestion, setCurrentQuestion] = useState({
    lettersColorIndex: 0,
    backgroundColorIndex: 1, // Different from lettersColorIndex
    textSelected: 0,
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  /* const [timer, setTimer] = useState(null); */

  // Device detection state
  const [deviceType, setDeviceType] = useState(getWindowDimensions());

  // Handle window resize
  useLayoutEffect(() => {
    function updateSize() {
      setDeviceType(getWindowDimensions());
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && !showAnswer) {
        setShowExit(true);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showAnswer]);

  // Selection screen animation
  // Selection screen animation
  useEffect(() => {
    if (currentScreen === SCREENS.SELECTION && !isSelectionFixed) {
      const changeInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * COLOR_NAMES.length);
        setSelectionIndex(randomIndex);
        setSelectionY(
          SELECTION_CONFIG.START_Y +
            randomIndex * SELECTION_CONFIG.STRIPE_HEIGHT
        );
      }, SELECTION_CONFIG.CHANGE_INTERVAL);

      const fixTimeout = setTimeout(() => {
        clearInterval(changeInterval);
        setIsSelectionFixed(true);
        setTimeout(() => {
          setCurrentScreen(SCREENS.MAIN);
          setIsSelectionFixed(false);
        }, SELECTION_CONFIG.PAUSE_DURATION);
      }, SELECTION_CONFIG.SELECTION_DURATION);

      return () => {
        clearInterval(changeInterval);
        clearTimeout(fixTimeout);
      };
    }
  }, [currentScreen, isSelectionFixed]);

  // Timer for main screen
  useEffect(() => {
    if (currentScreen === SCREENS.MAIN && !showAnswer) {
      const interval = setInterval(() => {
        setGameStats((prev) => ({
          ...prev,
          timeSpent: prev.timeSpent + 1,
          timePerAnswer:
            prev.questionsAll > 0
              ? Math.round(prev.timeSpent / prev.questionsAll)
              : 0,
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen, showAnswer]);

  const generateNewQuestion = useCallback(() => {
    let lettersIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    let bgIdx;
    do {
      bgIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    } while (bgIdx === lettersIdx);

    /* setCurrentQuestion((prev) => ({ */
    setCurrentQuestion({
      lettersColorIndex: lettersIdx,
      backgroundColorIndex: bgIdx,
      textSelected: selectionIndex,
    });
  }, [selectionIndex]);

  // Call generateNewQuestion when entering MAIN screen
  useEffect(() => {
    if (currentScreen === SCREENS.MAIN) {
      generateNewQuestion();
    }
  }, [currentScreen, generateNewQuestion]);

  const handleAnswer = (answerIndex) => {
    const isCorrect =
      (settings.regim === 1
        ? Math.floor(Math.random() * 2)
        : settings.optionIndex) === 0
        ? answerIndex === currentQuestion.lettersColorIndex
        : answerIndex === currentQuestion.backgroundColorIndex;

    setIsAnswerCorrect(isCorrect);
    setShowAnswer(true);
  };

  const resetGame = () => {
    setGameStats({
      questionsAll: 0,
      answersCorrect: 0,
      answersWrong: 0,
      timeSpent: 0,
      timePerAnswer: 0,
    });
    setCurrentScreen(SCREENS.INTRO);
    setShowExit(false);
  };

  // Components
  const IntroScreen = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-black via-red-500 to-violet-600">
      <h1 className="text-8xl font-bold text-white mb-12 text-center">
        Crazy Colors
      </h1>
      <div className="flex flex-col gap-4 items-center">
        <button
          onClick={() => setCurrentScreen(SCREENS.SELECTION)}
          className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 hover:scale-110 transition-all duration-300 font-bold w-48"
          /* className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 hover:scale-110 transition-all duration-300 font-bold shadow-lg w-48" */
        >
          START
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 hover:scale-110 transition-all duration-300 font-bold shadow-lg w-48"
        >
          SETTINGS
        </button>
        <button
          onClick={() => setShowExit(true)}
          className="bg-teal-500 text-white px-8 py-3 rounded-lg hover:bg-teal-600 hover:scale-110 transition-all duration-300 font-bold shadow-lg w-48"
        >
          QUIT
        </button>
      </div>
    </div>
  );

  const SelectionScreen = () => {
    const stripeHeight = deviceType.isMobile
      ? SELECTION_CONFIG.STRIPE_HEIGHT.MOBILE
      : SELECTION_CONFIG.STRIPE_HEIGHT.DESKTOP;

    const startY = deviceType.isMobile
      ? SELECTION_CONFIG.START_Y.MOBILE
      : SELECTION_CONFIG.START_Y.DESKTOP;

    return (
      <div className="h-screen w-full relative overflow-hidden">
        {/* Color stripes */}
        <div className="absolute inset-0 flex flex-col items-center">
          {COLOR_CODES.map((color, index) => (
            <div
              key={index}
              className="absolute w-full"
              style={{
                backgroundColor: color,
                height: `${stripeHeight}px`,
                top: `${
                  SELECTION_CONFIG.START_Y +
                  index * SELECTION_CONFIG.STRIPE_HEIGHT
                }px`,
              }}
            />
          ))}
        </div>

        {/* Moving/Selected word */}
        <button
          className={`absolute left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white font-bold z-10 text-sm        
            ${
              isSelectionFixed
                ? "transition-all duration-500"
                : "transition-all duration-300"
            }`}
          style={{
            top: isSelectionFixed
              ? `${
                  SELECTION_CONFIG.START_Y +
                  4 * SELECTION_CONFIG.STRIPE_HEIGHT +
                  SELECTION_CONFIG.STRIPE_HEIGHT / 2
                }px`
              : `${selectionY + SELECTION_CONFIG.STRIPE_HEIGHT / 2}px`,
            backgroundColor: "#C0C0C0", // silver
            color: "#FFFFFF", // white
            /*            textShadow: "2px 2px 4px rgba(0,0,0,0.5)",  */
            transform: `translate(-50%, -50%) ${
              isSelectionFixed ? "scale(3)" : "scale(2)"
            }`,
          }}
        >
          {COLOR_NAMES[selectionIndex]}
        </button>
      </div>
    );
  };

  const MainScreen = () => (
    <div className="h-screen w-full flex flex-col p-4 bg-gray-100">
      {/* Section 1: Title */}
      <h2 className="text-2xl font-bold mb-4 text-center">
        {
          OPTIONS[
            settings.regim === 1
              ? Math.floor(Math.random() * 2)
              : settings.optionIndex
          ]
        }
      </h2>

      {/* Section 2: Statistics */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <p>Всего вопросов: {gameStats.questionsAll}</p>
        <p className="text-green-600">Правильно: {gameStats.answersCorrect}</p>
        <p className="text-red-600">Неверно: {gameStats.answersWrong}</p>
        <p>
          Время: {Math.floor(gameStats.timeSpent / 60)}:
          {(gameStats.timeSpent % 60).toString().padStart(2, "0")}
        </p>
        <p>Среднее время: {gameStats.timePerAnswer}с</p>
      </div>

      {/* Section 3: Color Display */}
      <div
        className="p-8 rounded-lg mb-4 flex items-center justify-center text-4xl font-bold"
        style={{
          backgroundColor: COLOR_CODES[currentQuestion.backgroundColorIndex],
          color: COLOR_CODES[currentQuestion.lettersColorIndex],
        }}
      >
        {COLOR_NAMES[currentQuestion.textSelected]}
      </div>

      {/* Section 4: Color Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {COLOR_NAMES.map((name, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Настройки</h2>
        <div className="space-y-4">
          <div>
            <input
              type="radio"
              id="colorLetters"
              checked={settings.optionIndex === 0}
              onChange={() =>
                setSettings((prev) => ({ ...prev, optionIndex: 0 }))
              }
            />
            <label htmlFor="colorLetters" className="ml-2">
              Указывать цвет букв
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="colorBackground"
              checked={settings.optionIndex === 1}
              onChange={() =>
                setSettings((prev) => ({ ...prev, optionIndex: 1 }))
              }
            />
            <label htmlFor="colorBackground" className="ml-2">
              Указывать цвет фона
            </label>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(false)}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Закрыть
        </button>
      </div>
    </div>
  );

  const ExitModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="bg-cyan-200 p-4 rounded-lg mb-6">
          <h2 className="text-3xl font-bold text-center">ВЫХОД</h2>
        </div>
        <div className="space-y-2 mb-6">
          <p>Всего вопросов: {gameStats.questionsAll}</p>
          <p>Отвечено правильно: {gameStats.answersCorrect}</p>
          <p>Отвечено неверно: {gameStats.answersWrong}</p>
          <p>Среднее время на ответ: {gameStats.timePerAnswer}с</p>
        </div>
        <div className="bg-cyan-200 p-4 rounded-lg mb-6">
          <p className="text-3xl font-bold text-center">
            Вы уверены, что хотите выйти?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowExit(false)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Продолжить
          </button>
          <button
            onClick={resetGame}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Начать заново
          </button>
          <button
            onClick={() => {
              setShowExit(false);
              setShowSettings(true);
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Настройки
          </button>
          <button
            onClick={() => {
              window.open("", "_self").close();
              window.close();
              if (window.electron) {
                window.electron.closeWindow();
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );

  const AnswerModal = () => {
    // Handle any key press except ESC
    useEffect(() => {
      const handleKeyPress = (event) => {
        if (event.key === "Escape") {
          setShowAnswer(false);
          setShowExit(true);
        } else {
          setShowAnswer(false);
          setCurrentScreen(SCREENS.SELECTION);
        }
      };
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }, []);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div
          className="p-6 rounded-lg w-96 text-center"
          style={{ backgroundColor: isAnswerCorrect ? "#7DF9FF" : "#FAA0A0" }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {isAnswerCorrect ? "Это верный ответ!" : "Неправильно!"}
          </h2>
          <p>Для продолжения нажмите любую кнопку</p>
          <button
            onClick={() => {
              setGameStats((prev) => ({
                ...prev,
                questionsAll: prev.questionsAll + 1,
                answersCorrect: prev.answersCorrect + (isAnswerCorrect ? 1 : 0),
                answersWrong: prev.answersWrong + (isAnswerCorrect ? 0 : 1),
              }));
              setShowAnswer(false);
              setCurrentScreen(SCREENS.SELECTION);
            }}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Продолжить
          </button>
        </div>
      </div>
    );
  };

  // Main render logic
  return (
    <div
      style={{
        width: deviceType.isMobile
          ? GAME_DIMENSIONS.MOBILE.width
          : GAME_DIMENSIONS.DESKTOP.width,
        height: deviceType.isMobile
          ? GAME_DIMENSIONS.MOBILE.minHeight
          : GAME_DIMENSIONS.DESKTOP.height,
        margin: "0 auto",
        maxWidth: "100%",
      }}
      className="relative bg-white shadow-lg overflow-hidden h-screen w-full max-w-md mx-auto"
    >
      {currentScreen === SCREENS.INTRO && <IntroScreen />}
      {currentScreen === SCREENS.SELECTION && <SelectionScreen />}
      {currentScreen === SCREENS.MAIN && <MainScreen />}
      {showSettings && <SettingsModal />}
      {showExit && <ExitModal />}
      {showAnswer && <AnswerModal />}
    </div>
  );
}

export default CrazyColorsGame;
