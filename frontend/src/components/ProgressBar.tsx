import React from 'react';
import { formatCurrency } from '../utils/helpers';

interface ProgressBarProps {
  current: number;
  target: number;
  title: string;
  description?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  title,
  description
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-pola-blue">
            {formatCurrency(current)}
          </span>
          <span className="text-gray-600">
            de {formatCurrency(target)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-pola-blue to-dominican-blue h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">
            {percentage.toFixed(1)}% completado
          </span>
          <span className="text-sm font-medium text-gray-800">
            {formatCurrency(target - current)} restantes
          </span>
        </div>
      </div>

      {percentage >= 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm font-medium">
            🎉 ¡Meta alcanzada! Gracias por tu apoyo.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;