import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminNavbarWrapper from '../AdminNavbarWrapper';
import * as getCommunityInfoModule from '../getCommunityInfo';

vi.mock('../getCommunityInfo', () => ({
  getCommunityInfo: vi.fn(),
}));

vi.mock('../AdminNavbar', () => ({
  AdminNavbar: ({ community }: any) => (
    <div data-testid="admin-navbar">
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

describe('AdminNavbarWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders AdminNavbar with community data', async () => {
    const mockCommunity = {
      id: 'comm-123',
      full_address: '456 Oak Avenue',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="admin-navbar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="community-id"]')).toHaveTextContent('comm-123');
    expect(container.querySelector('[data-testid="community-address"]')).toHaveTextContent('456 Oak Avenue');
  });

  it('renders AdminNavbar with null community when no data is returned', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="admin-navbar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="no-community"]')).toBeInTheDocument();
  });

  it('calls getCommunityInfo during render', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    await AdminNavbarWrapper();

    expect(getCommunityInfoModule.getCommunityInfo).toHaveBeenCalledTimes(1);
    expect(getCommunityInfoModule.getCommunityInfo).toHaveBeenCalledWith();
  });

  it('passes complete community data to AdminNavbar', async () => {
    const mockCommunity = {
      id: 'test-community-id',
      full_address: 'Test Address 123, Building A',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="community-id"]')).toHaveTextContent('test-community-id');
    expect(container.querySelector('[data-testid="community-address"]')).toHaveTextContent('Test Address 123, Building A');
  });

  it('handles getCommunityInfo returning undefined', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(undefined as any);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="admin-navbar"]')).toBeInTheDocument();
  });

  it('renders without errors when getCommunityInfo resolves', async () => {
    const mockCommunity = {
      id: '1',
      full_address: 'Address',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    await expect(AdminNavbarWrapper()).resolves.toBeDefined();
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

      const component = await AdminNavbarWrapper();
      const { container } = render(component);

      const addressElement = container.querySelector('[data-testid="community-address"]');
      if (address) {
        expect(addressElement).toHaveTextContent(address);
      }
    }
  });

  it('renders AdminNavbar exactly once', async () => {
    const mockCommunity = {
      id: '1',
      full_address: 'Test Address',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    const navbars = container.querySelectorAll('[data-testid="admin-navbar"]');
    expect(navbars).toHaveLength(1);
  });

  it('returns valid React component', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const component = await AdminNavbarWrapper();
    
    expect(component).toBeDefined();
    expect(typeof component).toBe('object');
  });

  it('handles special characters in community address', async () => {
    const mockCommunity = {
      id: 'special-123',
      full_address: 'Str. №5, Apt. 3/4, "Building A" & Co.',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="community-address"]')).toHaveTextContent('Str. №5, Apt. 3/4, "Building A" & Co.');
  });

  it('preserves community id type', async () => {
    const mockCommunity = {
      id: '12345-uuid-format',
      full_address: 'Test',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="community-id"]')).toHaveTextContent('12345-uuid-format');
  });

  it('wrapper is an async server component', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const result = AdminNavbarWrapper();
    
    expect(result).toBeInstanceOf(Promise);
  });

  it('handles getCommunityInfo rejection gracefully', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockRejectedValue(new Error('Database error'));

    await expect(AdminNavbarWrapper()).rejects.toThrow('Database error');
  });

  it('renders fragment wrapper correctly', async () => {
    const mockCommunity = {
      id: '1',
      full_address: 'Test',
    };

    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(mockCommunity);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="admin-navbar"]')).toBeInTheDocument();
  });

  it('passes null correctly when getCommunityInfo returns null', async () => {
    vi.mocked(getCommunityInfoModule.getCommunityInfo).mockResolvedValue(null);

    const component = await AdminNavbarWrapper();
    const { container } = render(component);

    expect(container.querySelector('[data-testid="no-community"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="community-id"]')).not.toBeInTheDocument();
  });
});