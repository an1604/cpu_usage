import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

jest.mock('./config/config', () => ({
  Config: {
    getInstance: () => ({
      apiBaseUrl: 'http://localhost:3000'
    }),
    resetInstance: jest.fn()
  },
  config: {
    apiBaseUrl: 'http://localhost:3000'
  }
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
