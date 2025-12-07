import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import UserNavbarWrapper from '../UserNavbarWrapper';
import * as getCommunityInfoModule from '../getCommunityInfo';

vi.mock('../getCommunityInfo', () => ({
  getCommunityInfo: vi.fn(),
}));

vi.mock('../UserNavbar', () => ({
  UserNavbar: ({ community }: any) => (
    <div data-testid="user-navbar">
      {community ? (
        <>
          <span data-testid="community-id">{community.id}</span>
          <span data-testid="community-address">{community.full_address}</span>
        </>
      ) : (
        <span data-testid="no-community">No community</span>
      )}
    </div>
  ),
}));

describe('UserNavbarWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders UserNavbar with community data', async () => {
    const mockCommunity = {
      id: 'resident-comm-123',
      full_address: '789 Resident Street',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="user-navbar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="community-id"]')).toHaveTextContent('resident-comm-123');
    expect(container.querySelector('[data-testid="community-address"]')).toHaveTextContent('789 Resident Street');
  });

  it('renders UserNavbar with null community when no data is returned', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="user-navbar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="no-community"]')).toBeInTheDocument();
  });

  it('calls getCommunityInfo during render', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    await UserNavbarWrapper();

    expect(getCommunityInfoModule.getCommunityInfo).toHaveBeenCalledTimes(1);
    expect(getCommunityInfoModule.getCommunityInfo).toHaveBeenCalledWith();
  });

  it('passes complete community data to UserNavbar', async () => {
    const mockCommunity = {
      id: 'test-resident-id',
      full_address: 'Test Resident Address 456, Unit B',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="community-id"]')).toHaveTextContent('test-resident-id');
    expect(container.querySelector('[data-testid="community-address"]')).toHaveTextContent('Test Resident Address 456, Unit B');
  });

  it('handles getCommunityInfo returning undefined', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(undefined as any);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="user-navbar"]')).toBeInTheDocument();
  });

  it('renders without errors when getCommunityInfo resolves', async () => {
    const mockCommunity = {
      id: '1',
      full_address: 'Address',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    await expect(UserNavbarWrapper()).resolves.toBeDefined();
  });

  it('handles different community addresses correctly', async () => {
    const addresses = [
      '123 Main Street',
      'Apartment 5B, Building C',
      'Very Long Address With Many Details, Street 123, Building 4, Floor 5',
      '',
    ];

    for (const address of addresses) {
      vi.clearAllMocks();
      const mockCommunity = {
        id: `id-${address.length}`,
        full_address: address,
      };

      vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

      const component = await UserNavbarWrapper();
      const { container } = render(component);

      const addressElement = container.querySelector('[data-testid="community-address"]');
      if (address) {
        expect(addressElement).toHaveTextContent(address);
      }
    }
  });

  it('renders UserNavbar exactly once', async () => {
    const mockCommunity = {
      id: '1',
      full_address: 'Test Address',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    const navbars = container.querySelectorAll('[data-testid="user-navbar"]');
    expect(navbars).toHaveLength(1);
  });

  it('returns valid React component', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const component = await UserNavbarWrapper();
    
    expect(component).toBeDefined();
    expect(typeof component).toBe('object');
  });

  it('handles special characters in community address', async () => {
    const mockCommunity = {
      id: 'special-resident-123',
      full_address: 'Str. №5, Apt. 3/4, "Building A" & Co.',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="community-address"]')).toHaveTextContent('Str. №5, Apt. 3/4, "Building A" & Co.');
  });

  it('preserves community id type', async () => {
    const mockCommunity = {
      id: '67890-uuid-format',
      full_address: 'Test',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="community-id"]')).toHaveTextContent('67890-uuid-format');
  });

  it('wrapper is an async server component', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const result = UserNavbarWrapper();
    
    expect(result).toBeInstanceOf(Promise);
  });

  it('handles getCommunityInfo rejection gracefully', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockRejectedValue(new Error('Database error'));

    await expect(UserNavbarWrapper()).rejects.toThrow('Database error');
  });

  it('renders fragment wrapper correctly', async () => {
    const mockCommunity = {
      id: '1',
      full_address: 'Test',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="user-navbar"]')).toBeInTheDocument();
  });

  it('passes null correctly when getCommunityInfo returns null', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const component = await UserNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="no-community"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="community-id"]')).not.toBeInTheDocument();
  });

  it('uses same getCommunityInfo as AdminNavbarWrapper', async () => {
    const mockCommunity = {
      id: 'shared-comm',
      full_address: 'Shared Address',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    await UserNavbarWrapper();

    expect(getCommunityInfoModule.getCommunityInfo).toHaveBeenCalled();
  });
});