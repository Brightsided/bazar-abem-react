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
        case '+': result = prev + current; break;
        case '-': result = prev - current; break;
        case '*': result = prev * current; break;
        case '/': result = prev / current; break;
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

  const numBtn = "py-2.5 px-3 rounded-lg text-sm font-semibold bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 hover:bg-surface-200 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 transition-colors active:scale-95 duration-100";
  const opBtn = "py-2.5 px-3 rounded-lg text-sm font-semibold bg-mint-500/10 dark:bg-mint-500/15 text-mint-700 dark:text-mint-400 hover:bg-mint-500/20 dark:hover:bg-mint-500/25 border border-mint-200 dark:border-mint-800 transition-colors active:scale-95 duration-100";

  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mb-3 flex items-center gap-2">
        <i className="fas fa-calculator text-mint-500 text-xs"></i>
        Calculadora
      </h2>

      {/* Display */}
      <div className="bg-surface-950 rounded-lg p-3 mb-3 border border-surface-800">
        <div className="text-right text-2xl font-mono text-mint-400 font-bold break-all leading-tight">
          {display}
        </div>
        {operation && previousValue && (
          <div className="text-right text-xs text-surface-500 mt-1">
            {previousValue} {operation}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        <button onClick={handleClear} className="col-span-2 py-2.5 px-3 rounded-lg text-sm font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-200 dark:border-red-900 transition-colors active:scale-95 duration-100">
          C
        </button>
        <button onClick={() => handleOperation('/')} className={opBtn}>÷</button>
        <button onClick={() => handleOperation('*')} className={opBtn}>×</button>

        {[7, 8, 9].map((n) => (
          <button key={n} onClick={() => handleNumber(n.toString())} className={numBtn}>{n}</button>
        ))}
        <button onClick={() => handleOperation('-')} className={opBtn}>−</button>

        {[4, 5, 6].map((n) => (
          <button key={n} onClick={() => handleNumber(n.toString())} className={numBtn}>{n}</button>
        ))}
        <button onClick={() => handleOperation('+')} className={opBtn}>+</button>

        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => handleNumber(n.toString())} className={numBtn}>{n}</button>
        ))}
        <button onClick={handleEquals} className="row-span-2 py-2.5 px-3 rounded-lg text-sm font-bold bg-mint-500 text-white hover:bg-mint-600 transition-colors active:scale-95 duration-100">
          =
        </button>

        <button onClick={() => handleNumber('0')} className={`col-span-2 ${numBtn}`}>0</button>
        <button onClick={handleDecimal} className={numBtn}>.</button>
      </div>
    </div>
  );
};

export default Calculator;
