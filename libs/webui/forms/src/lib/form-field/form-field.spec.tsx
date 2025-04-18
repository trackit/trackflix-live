import { render, screen } from '@testing-library/react';
import { FormField } from './form-field';
import { z } from 'zod';
import { UseFormRegister } from 'react-hook-form';
import { formSchema } from '../single-asset-form/single-asset-form';

describe('FormField', () => {
  const mockRegister = jest.fn() as unknown as UseFormRegister<z.infer<typeof formSchema>>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    render(
      <FormField
        label="Test Label"
        register={mockRegister}
        name="name"
        error={undefined}
      />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies error class when error is provided', () => {
    render(
      <FormField
        label="Test Label"
        register={mockRegister}
        name="name"
        error={{ type: 'required', message: 'This field is required' }}
      />
    );

    const labelElement = screen.getByText('Test Label').closest('label');
    expect(labelElement).toHaveClass('input-error');
  });

  it('sets the correct input type', () => {
    render(
      <FormField
        label="Password"
        register={mockRegister}
        name="name"
        error={undefined}
        type="password"
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');
  });

  it('sets the placeholder when provided', () => {
    const placeholder = 'Enter your text here';
    render(
      <FormField
        label="Test Label"
        register={mockRegister}
        name="name"
        error={undefined}
        placeholder={placeholder}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', placeholder);
  });

  it('renders select input when type is select', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ];
    
    render(
      <FormField
        label="Select Option"
        register={mockRegister}
        name="inputType"
        error={undefined}
        type="select"
        options={options}
      />
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });
});
