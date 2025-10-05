import React from 'react';
import renderer, { act } from 'react-test-renderer';
import TodoScreen from '../src/screens/TodoScreen';

describe('TodoScreen', () => {
  it('renders', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<TodoScreen />);
      // wait a tick for effects
      await Promise.resolve();
    });
    expect(tree).not.toBeNull();
    // safe to assert toJSON after null-check
    expect(tree!.toJSON()).toBeTruthy();
  });
});
