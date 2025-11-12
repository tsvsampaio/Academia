
import React from 'react';

const LoadingSpinner: React.FC = () => {
  const messages = [
    "Consultando especialistas em fitness...",
    "Montando seu plano de treino...",
    "Calculando séries e repetições ideais...",
    "Ajustando para seus equipamentos...",
    "Quase pronto para você suar!",
  ];

  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 w-full max-w-md">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-lg text-gray-300 font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
