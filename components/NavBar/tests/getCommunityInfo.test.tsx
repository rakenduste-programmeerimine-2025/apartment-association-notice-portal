import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCommunityInfo } from '../getCommunityInfo';
import * as supabaseServer from '@/lib/supabase/server';

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('getCommunityInfo', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabaseClient = {
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    };

    mockFrom.mockReturnValue({
      select: mockSelect,
    });

    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      single: mockSingle,
    });

    vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabaseClient);
  });

  it('returns community info when user is authenticated and has a community', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { id: 'comm-456', full_address: '789 Pine Street' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    const result = await getCommunityInfo();

    expect(result).toEqual(mockCommunity);
    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockFrom).toHaveBeenCalledWith('communities');
  });

  it('returns null when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns null when auth data is missing', async () => {
    mockGetUser.mockResolvedValue({ data: null, error: null });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns null when user has no community_id', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: null };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockFrom).not.toHaveBeenCalledWith('communities');
  });

  it('returns null when community is not found', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
  });

  it('queries users table with correct user id', async () => {
    const mockUser = { id: 'specific-user-id' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { id: 'comm-456', full_address: '123 Test St' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    expect(mockSelect).toHaveBeenCalledWith('community_id');
    expect(mockEq).toHaveBeenCalledWith('id', 'specific-user-id');
  });

  it('queries communities table with correct community id', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'specific-comm-id' };
    const mockCommunity = { id: 'specific-comm-id', full_address: '456 Test Ave' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    expect(mockFrom).toHaveBeenNthCalledWith(2, 'communities');
    expect(mockSelect).toHaveBeenCalledWith('id, full_address');
    expect(mockEq).toHaveBeenNthCalledWith(2, 'id', 'specific-comm-id');
  });

  it('handles database error when fetching user profile', async () => {
    const mockUser = { id: 'user-123' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Database error' } 
    });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
  });

  it('handles database error when fetching community', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Community not found' } 
    });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
  });

  it('returns null when user profile data is null', async () => {
    const mockUser = { id: 'user-123' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: null, error: null });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
  });

  it('creates Supabase client on each call', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { id: 'comm-456', full_address: 'Test' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    expect(supabaseServer.createClient).toHaveBeenCalledTimes(1);
  });

  it('follows correct query flow', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { id: 'comm-456', full_address: 'Test' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    // Verify order of operations
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenNthCalledWith(1, 'users');
    expect(mockFrom).toHaveBeenNthCalledWith(2, 'communities');
  });

  it('returns community with correct structure', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { 
      id: 'comm-456', 
      full_address: '123 Main St, City, State, ZIP' 
    };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    const result = await getCommunityInfo();

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('full_address');
    expect(result?.id).toBe('comm-456');
    expect(result?.full_address).toBe('123 Main St, City, State, ZIP');
  });

  it('handles empty string community_id', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: '' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
  });

  it('handles undefined community_id', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: undefined };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
  });

  it('selects only required fields from users table', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456', other_field: 'ignored' };
    const mockCommunity = { id: 'comm-456', full_address: 'Test' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    expect(mockSelect).toHaveBeenCalledWith('community_id');
  });

  it('selects only required fields from communities table', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { id: 'comm-456', full_address: 'Test' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    expect(mockSelect).toHaveBeenCalledWith('id, full_address');
  });

  it('uses single() to get one record from users', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { id: 'comm-456', full_address: 'Test' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    expect(mockSingle).toHaveBeenCalledTimes(2);
  });

  it('handles auth error gracefully', async () => {
    mockGetUser.mockResolvedValue({ 
      data: null, 
      error: { message: 'Auth error' } 
    });

    const result = await getCommunityInfo();

    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns null when profile has falsy community_id', async () => {
    const mockUser = { id: 'user-123' };
    const falsyCommunityIds = [null, undefined, '', 0, false];

    for (const falsyId of falsyCommunityIds) {
      vi.clearAllMocks();
      vi.mocked(supabaseServer.createClient).mockResolvedValue(mockSupabaseClient);
      
      mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSingle.mockResolvedValueOnce({ 
        data: { community_id: falsyId }, 
        error: null 
      });

      const result = await getCommunityInfo();

      expect(result).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockFrom).not.toHaveBeenCalledWith('communities');
    }
  });

  it('is a server-side function', async () => {
    const mockUser = { id: 'user-123' };
    const mockProfile = { community_id: 'comm-456' };
    const mockCommunity = { id: 'comm-456', full_address: 'Test' };

    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null });
    mockSingle.mockResolvedValueOnce({ data: mockCommunity, error: null });

    await getCommunityInfo();

    expect(supabaseServer.createClient).toHaveBeenCalled();
  });
});