import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  it('shows the initials without a photo', () => {
    const { container } = renderWithProviders(
      <UserAvatar src={null} initials="AK" />,
    );
    expect(container).toHaveTextContent('AK');
    expect(container.querySelector('img')).toBeNull();
  });

  it('shows the photo when there is one', () => {
    const { container } = renderWithProviders(
      <UserAvatar src="https://cdn.test/ali.png" initials="AK" />,
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.test/ali.png',
    );
  });

  it('falls back to the initials when the photo fails to load', () => {
    const { container } = renderWithProviders(
      <UserAvatar src="https://cdn.test/broken.png" initials="AK" />,
    );
    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    fireEvent.error(image as HTMLImageElement);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('AK');
  });
});
