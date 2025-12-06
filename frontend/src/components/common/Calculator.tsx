import { useState } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: string) => {
    setPreviousValue(display);
    setOperation(op);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (previousValue && operation) {
      const prev = parseFloat(previousValue);
      const current = parseFloat(display);
      let result = 0;

      switch (operation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '*':
          result = prev * current;
          break;
        case '/':
          result = prev / current;
          break;
      }

      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/5 light:bg-white/80 border border-white/20 dark:border-white/10 light:border-gray-200 p-6 hover:border-white/40 dark:hover:border-white/20 light:hover:border-gray-300 transition-all duration-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 dark:from-purple-600/10 dark:to-blue-600/10 light:from-purple-600/5 light:to-blue-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white light:text-gray-900 mb-4 flex items-center">
          <i className="fas fa-calculator mr-2 text-purple-500 dark:text-purple-400 light:text-purple-600"></i>
          Calculadora
        </h2>
        
        {/* Display */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 light:from-gray-100 light:to-gray-200 rounded-lg p-4 mb-4 border border-white/10 dark:border-white/10 light:border-gray-300">
          <div className="text-right text-3xl font-mono text-transparent bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-400 dark:to-purple-400 light:from-blue-600 light:to-purple-600 bg-clip-text font-bold break-all">
            {display}
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="col-span-2 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/50"
          >
            <i className="fas fa-redo mr-1"></i>C
          </button>
          
          {/* Division */}
          <button
            onClick={() => handleOperation('/')}
            className="py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
          >
            ÷
          </button>
          
          {/* Multiply */}
          <button
            onClick={() => handleOperation('*')}
            className="py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
          >
            ×
          </button>

          {/* Numbers 7, 8, 9 */}
          {[7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              className="py-3 px-4 rounded-lg font-semibold text-gray-900 dark:text-white bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20 dark:border-white/10"
            >
              {num}
            </button>
          ))}
          
          {/* Subtract */}
          <button
            onClick={() => handleOperation('-')}
            className="py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
          >
            −
          </button>

          {/* Numbers 4, 5, 6 */}
          {[4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              className="py-3 px-4 rounded-lg font-semibold text-gray-900 dark:text-white bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20 dark:border-white/10"
            >
              {num}
            </button>
          ))}
          
          {/* Add */}
          <button
            onClick={() => handleOperation('+')}
            className="py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-orange-500/50"
          >
            +
          </button>

          {/* Numbers 1, 2, 3 */}
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              className="py-3 px-4 rounded-lg font-semibold text-gray-900 dark:text-white bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20 dark:border-white/10"
            >
              {num}
            </button>
          ))}
          
          {/* Equals */}
          <button
            onClick={handleEquals}
            className="row-span-2 py-3 px-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/50"
          >
            =
          </button>

          {/* Zero */}
          <button
            onClick={() => handleNumber('0')}
            className="col-span-2 py-3 px-4 rounded-lg font-semibold text-gray-900 dark:text-white bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20 dark:border-white/10"
          >
            0
          </button>
          
          {/* Decimal */}
          <button
            onClick={handleDecimal}
            className="py-3 px-4 rounded-lg font-semibold text-gray-900 dark:text-white bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20 dark:border-white/10"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
