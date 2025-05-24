import React from 'react';
import { ErrorMessageProps } from '../types/metrics';

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage; 