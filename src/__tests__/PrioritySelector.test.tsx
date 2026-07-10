import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PrioritySelector } from '../ui/components/PrioritySelector';

describe('PrioritySelector Component', () => {
  test('renders all five priority buttons', async () => {
    const { getByText, getByLabelText } = await render(
      <PrioritySelector value={null} onChange={() => {}} />
    );

    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();

    expect(getByLabelText('Priority 1 - 1 - Critical/Life-Threatening')).toBeTruthy();
    expect(getByLabelText('Priority 5 - 5 - Routine')).toBeTruthy();
  });

  test('calls onChange when a priority is pressed', async () => {
    const handleChange = jest.fn();
    const { getByText } = await render(
      <PrioritySelector value={null} onChange={handleChange} />
    );

    fireEvent.press(getByText('3'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  test('applies selected styling to active priority level', async () => {
    const { getByText } = await render(
      <PrioritySelector value={2} onChange={() => {}} />
    );

    const selectedButton = getByText('2').parent;
    expect(selectedButton?.props.accessibilityState.selected).toBe(true);

    const unselectedButton = getByText('4').parent;
    expect(unselectedButton?.props.accessibilityState.selected).toBe(false);
  });
});
