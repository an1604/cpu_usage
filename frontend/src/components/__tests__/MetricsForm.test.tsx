import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MetricsForm from '../MetricsForm';

describe('MetricsForm', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should update form data when input changes', () => {
    render(<MetricsForm {...defaultProps} />);
    
    const ipInput = screen.getByLabelText(/ip address/i);
    fireEvent.change(ipInput, { target: { name: 'ipAddress', value: '192.168.1.1' } });
    expect(ipInput).toHaveValue('192.168.1.1');

    const timeRangeSelect = screen.getByLabelText(/time period/i);
    fireEvent.change(timeRangeSelect, { target: { name: 'timeRange', value: 'Last 6 Hours' } });
    expect(timeRangeSelect).toHaveValue('Last 6 Hours');

    const periodSelect = screen.getByLabelText(/interval/i);
    fireEvent.change(periodSelect, { target: { name: 'period', value: '300' } });
    expect(periodSelect).toHaveValue('300');
  });

  it('should convert period to number while keeping other fields as strings', () => {
    render(<MetricsForm {...defaultProps} />);
    
    const ipInput = screen.getByLabelText(/ip address/i);
    const timeRangeSelect = screen.getByLabelText(/time period/i);
    const periodSelect = screen.getByLabelText(/interval/i);

    fireEvent.change(ipInput, { target: { name: 'ipAddress', value: '192.168.1.1' } });
    fireEvent.change(timeRangeSelect, { target: { name: 'timeRange', value: 'Last 6 Hours' } });
    fireEvent.change(periodSelect, { target: { name: 'period', value: '300' } });

    const submitButton = screen.getByRole('button', { name: /get cpu usage/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      ipAddress: '192.168.1.1',
      timeRange: 'Last 6 Hours',
      period: 300
    });
  });

  it('should call onSubmit with form data when submitted', () => {
    render(<MetricsForm {...defaultProps} />);
    
    const ipInput = screen.getByLabelText(/ip address/i);
    const timeRangeSelect = screen.getByLabelText(/time period/i);
    const periodSelect = screen.getByLabelText(/interval/i);

    fireEvent.change(ipInput, { target: { name: 'ipAddress', value: '192.168.1.1' } });
    fireEvent.change(timeRangeSelect, { target: { name: 'timeRange', value: 'Last 6 Hours' } });
    fireEvent.change(periodSelect, { target: { name: 'period', value: '300' } });

    const submitButton = screen.getByRole('button', { name: /get cpu usage/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      ipAddress: '192.168.1.1',
      timeRange: 'Last 6 Hours',
      period: 300
    });
  });

  it('should prevent default form submission', () => {
    const mockOnSubmit = jest.fn();
    render(<MetricsForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const form = screen.getByTestId('metrics-form');
    
    fireEvent.submit(form);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should disable submit button when loading', () => {
    render(<MetricsForm {...defaultProps} isLoading={true} />);
    
    const submitButton = screen.getByText('Loading...');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Loading...');
  });

  it('should show correct button text based on loading state', () => {
    const { rerender } = render(<MetricsForm {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    rerender(<MetricsForm {...defaultProps} isLoading={false} />);
    expect(screen.getByText('Get CPU Usage')).toBeInTheDocument();
  });

  it('should validate IP address format', () => {
    render(<MetricsForm {...defaultProps} />);
    
    const ipInput = screen.getByLabelText(/ip address/i);
    
    fireEvent.change(ipInput, { target: { name: 'ipAddress', value: 'invalid-ip' } });
    expect(ipInput).toBeInvalid();
    
    fireEvent.change(ipInput, { target: { name: 'ipAddress', value: '192.168.1.1' } });
    expect(ipInput).toBeValid();
  });
}); 