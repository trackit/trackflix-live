import { render, screen } from '@testing-library/react';
import { FormField } from './form-field';
import { z } from 'zod';
import { UseFormRegister } from 'react-hook-form';
import { formSchema } from '../single-asset-form/single-asset-form';
import { InputType } from '@aws-sdk/client-medialive';

describe('FormField', () => {
  const mockRegister = vi.fn() as unknown as UseFormRegister<z.infer<typeof formSchema>>;
  
  beforeEach(() => {
    vi.clearAllMocks();
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

    expect(screen.getByText('Test Label')).toBeTruthy();
    expect(screen.getByRole('textbox')).toBeTruthy();
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
    expect(labelElement?.classList.contains('input-error')).toBe(true);
  });

  it('displays error message when error is provided', () => {
    render(
      <FormField
        label="Test Label"
        register={mockRegister}
        name="name"
        error={{ type: 'required', message: 'This field is required' }}
      />
    );

    expect(screen.getByText('This field is required')).toBeTruthy();
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

    const input = screen.getByLabelText('Password');
    expect(input.getAttribute('type')).toBe('password');
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

    const input = screen.getByLabelText('Test Label');
    expect(input.getAttribute('placeholder')).toBe(placeholder);
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

    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByText('Option 1')).toBeTruthy();
    expect(screen.getByText('Option 2')).toBeTruthy();
  });

  it('renders select input with InputType enum options', () => {
    const options = Object.values(InputType).map(value => ({
      value,
      label: value.replace(/_/g, ' ')
    }));
    
    render(
      <FormField
        label="Input Type"
        register={mockRegister}
        name="inputType"
        error={undefined}
        type="select"
        options={options}
      />
    );

    expect(screen.getByRole('combobox')).toBeTruthy();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });
});
