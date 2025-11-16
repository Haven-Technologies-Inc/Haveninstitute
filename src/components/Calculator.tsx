import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calculator as CalcIcon, X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Calculator({ isOpen, onToggle }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (previousValue !== null && operation && !newNumber) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(currentValue);
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '×':
        return prev * current;
      case '÷':
        return prev / current;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setNewNumber(true);
    }
  };

  return (
    <div className="relative">
      {/* Calculator Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={onToggle}
        className={`${isOpen ? 'bg-blue-50 border-blue-300' : ''}`}
        title="Calculator"
      >
        <CalcIcon className="size-5" />
      </Button>

      {/* Calculator Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={onToggle}
          />
          
          {/* Calculator Card */}
          <Card className="absolute top-full right-0 mt-2 p-4 shadow-2xl z-50 w-80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalcIcon className="size-5 text-blue-600" />
                <h3 className="font-medium">Calculator</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Display */}
            <div className="bg-gray-900 text-white p-4 rounded-lg mb-4 text-right">
              <div className="text-xs text-gray-400 h-4 mb-1">
                {previousValue !== null && operation && `${previousValue} ${operation}`}
              </div>
              <div className="text-2xl font-mono truncate">
                {display}
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <Button
                variant="outline"
                className="h-12 text-red-600"
                onClick={handleClear}
              >
                AC
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={handleBackspace}
              >
                ←
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleOperation('÷')}
              >
                ÷
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-blue-50"
                onClick={() => handleOperation('×')}
              >
                ×
              </Button>

              {/* Row 2 */}
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('7')}
              >
                7
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('8')}
              >
                8
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('9')}
              >
                9
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-blue-50"
                onClick={() => handleOperation('-')}
              >
                -
              </Button>

              {/* Row 3 */}
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('4')}
              >
                4
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('5')}
              >
                5
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('6')}
              >
                6
              </Button>
              <Button
                variant="outline"
                className="h-12 bg-blue-50"
                onClick={() => handleOperation('+')}
              >
                +
              </Button>

              {/* Row 4 */}
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('1')}
              >
                1
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('2')}
              >
                2
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => handleNumber('3')}
              >
                3
              </Button>
              <Button
                className="h-12 row-span-2 bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={handleEquals}
              >
                =
              </Button>

              {/* Row 5 */}
              <Button
                variant="outline"
                className="h-12 col-span-2"
                onClick={() => handleNumber('0')}
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={handleDecimal}
              >
                .
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              For medication calculations and dosage conversions
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
