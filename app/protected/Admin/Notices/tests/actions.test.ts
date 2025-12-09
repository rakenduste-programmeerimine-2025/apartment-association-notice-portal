import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  deletePastMeetings,
  getNotices,
  getMeetings,
  updateNotice,
  updateMeeting,
  deleteNotice,
  deleteMeeting,
} from "@/app/protected/Admin/Notices/actions";
import { revalidatePath } from 'next/cache';

// ==================== MOCKS ====================
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();

const mockGetUser = vi.fn();
const mockAuth = { getUser: mockGetUser };

const mockSupabase = {
  auth: mockAuth,
  from: mockFrom,
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Helpers for chain mocks
const resetMocks = () => {
  vi.clearAllMocks();
  mockFrom.mockReset();
  mockSelect.mockReset();
  mockEq.mockReset();
  mockSingle.mockReset();
  mockDelete.mockReset();
  mockUpdate.mockReset();
  mockOrder.mockReset();
  mockRange.mockReset();
  mockGetUser.mockReset();
};

beforeEach(() => {
  resetMocks();

  // Default: authorized user
  mockGetUser.mockResolvedValue({
    data: { user: { id: 'admin-123' } },
    error: null,
  });
});

// Helper functions to create mock chains
const createUsersQueryMock = (community_id = 'comm-1') => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { community_id },
      error: null,
    }),
  };
  return mockChain;
};

const createNoticesQueryMock = (data: any[] = [], count = 0, error = null) => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data, count, error }),
  };
  return mockChain;
};

// ==================== deletePastMeetings ====================
describe('deletePastMeetings', () => {
  it('deletes past meetings and revalidates the path', async () => {
    const now = new Date();
    const pastMeeting = {
      id: 'm1',
      meeting_date: '2023-01-01 10:00',
      duration: '1.5',
    };
    const futureMeeting = {
      id: 'm2',
      meeting_date: new Date(now.getTime() + 86400000).toISOString().slice(0, 16),
      duration: '2',
    };

    // Mock for first call (select meetings)
    const mockDeleteChain = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: [pastMeeting, futureMeeting],
          error: null,
        }),
      })
      .mockReturnValue({
        delete: vi.fn(() => mockDeleteChain),
      });

    await deletePastMeetings();

    expect(mockFrom).toHaveBeenCalledWith('meetings');
    expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Notices');
  });

  it('does not throw if meetings === null', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    await expect(deletePastMeetings()).resolves.not.toThrow();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('handles error on select', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockRejectedValue(new Error('DB down')),
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await deletePastMeetings();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error deleting past meetings:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

// ==================== getNotices ====================
describe('getNotices', () => {
  const mockNoticeData = [
    {
      id: 'n1',
      title: 'Important',
      content: 'Text',
      category: 'General',
      community_id: 'comm-1',
      created_at: '2024-01-01',
      likesnotice: [{ id: 'l1', user_id: 'u1' }, { id: 'l2', user_id: 'u2' }],
    },
  ];

  beforeEach(() => {
    // Mock users chain
    const usersChain = createUsersQueryMock();
    mockFrom.mockReturnValueOnce(usersChain);

    // Mock notices chain
    const noticesChain = createNoticesQueryMock(mockNoticeData, 10);
    mockFrom.mockReturnValueOnce(noticesChain);
  });

  it('returns notices with likesCount for admin', async () => {
    const result = await getNotices(1, 5);

    expect(result).toEqual({
      data: [
        {
          id: 'n1',
          title: 'Important',
          content: 'Text',
          category: 'General',
          community_id: 'comm-1',
          created_at: '2024-01-01',
          likesCount: 2,
        },
      ],
      count: 10,
    });
  });

  it('filters by category', async () => {
    resetMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    const usersChain = createUsersQueryMock();
    mockFrom.mockReturnValueOnce(usersChain);

    const eqSpy = vi.fn().mockReturnThis();
    const noticesChain = {
      select: vi.fn().mockReturnThis(),
      eq: eqSpy,
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
    };
    mockFrom.mockReturnValueOnce(noticesChain);

    await getNotices(1, 3, 'Safety');

    expect(eqSpy).toHaveBeenCalledWith('category', 'Safety');
  });

  it('sorts by oldest', async () => {
    resetMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    const usersChain = createUsersQueryMock();
    mockFrom.mockReturnValueOnce(usersChain);

    const orderSpy = vi.fn().mockReturnThis();
    const noticesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: orderSpy,
      range: vi.fn().mockResolvedValue({ data: [], count: 0, error: null }),
    };
    mockFrom.mockReturnValueOnce(noticesChain);

    await getNotices(1, 3, undefined, 'oldest');

    expect(orderSpy).toHaveBeenCalledWith('created_at', { ascending: true });
  });

  it('returns empty if unauthorized', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    const res = await getNotices();
    expect(res).toEqual({ data: [], count: 0 });
  });

  it('returns empty if no community_id', async () => {
    resetMocks();
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    const usersChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { community_id: null },
        error: null,
      }),
    };
    mockFrom.mockReturnValueOnce(usersChain);

    const res = await getNotices();
    expect(res).toEqual({ data: [], count: 0 });
  });
});

// ==================== getMeetings ====================
describe('getMeetings', () => {
  it('returns community meetings', async () => {
    const usersChain = createUsersQueryMock('c1');
    mockFrom.mockReturnValueOnce(usersChain);

    const meetingsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: 'm1', title: 'Meeting' }],
        error: null,
      }),
    };
    mockFrom.mockReturnValueOnce(meetingsChain);

    const res = await getMeetings();
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe('Meeting');
  });

  it('returns [] on error', async () => {
    const usersChain = createUsersQueryMock('c1');
    mockFrom.mockReturnValueOnce(usersChain);

    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockRejectedValue(new Error('boom')),
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await getMeetings();
    expect(res).toEqual([]);
    consoleSpy.mockRestore();
  });
});

// ==================== updateNotice ====================
describe('updateNotice', () => {
  const setupUpdateTest = (community_id = 'comm-1') => {
    const usersChain = createUsersQueryMock(community_id);
    mockFrom.mockReturnValueOnce(usersChain);

    const updateChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
    mockFrom.mockReturnValueOnce({
      update: vi.fn(() => updateChain),
    });
  };

  it('updates notice and revalidates', async () => {
    setupUpdateTest();

    await updateNotice('n123', {
      title: 'New',
      content: 'Text',
      category: 'Event',
    });

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockFrom).toHaveBeenCalledWith('notices');
    expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Notices');
  });

  it('throws if user is missing', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } });

    await expect(
      updateNotice('n1', { title: 'a', content: 'b', category: 'c' })
    ).rejects.toThrow('ERROR_UNAUTHORIZED_USER');
  });

  it('throws if community_id is missing', async () => {
    setupUpdateTest(null);

    await expect(
      updateNotice('n1', { title: 'a', content: 'b', category: 'c' })
    ).rejects.toThrow('ERROR_UNAUTHORIZED_COMMUNITY');
  });

  it('throws if Supabase returns error', async () => {
    const usersChain = createUsersQueryMock();
    mockFrom.mockReturnValueOnce(usersChain);

    const updateChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'not found' } }),
      }),
    };
    mockFrom.mockReturnValueOnce({
      update: vi.fn(() => updateChain),
    });

    await expect(
      updateNotice('n1', { title: 'a', content: 'b', category: 'c' })
    ).rejects.toThrow('not found');
  });
});

// ==================== updateMeeting ====================
describe('updateMeeting', () => {
  const setupUpdateMeetingTest = (community_id = 'comm-1') => {
    const usersChain = createUsersQueryMock(community_id);
    mockFrom.mockReturnValueOnce(usersChain);

    const updateChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
    mockFrom.mockReturnValueOnce({
      update: vi.fn(() => updateChain),
    });
  };

  it('updates meeting correctly', async () => {
    setupUpdateMeetingTest();

    await updateMeeting('m123', {
      title: 'New',
      description: 'Very important',
      meeting_date: '2025-12-25 15:00',
      duration: '2',
    });

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockFrom).toHaveBeenCalledWith('meetings');
    expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Notices');
  });
});

// ==================== deleteNotice ====================
describe('deleteNotice', () => {
  const setupDeleteNoticeTest = (community_id = 'comm-1') => {
    const usersChain = createUsersQueryMock(community_id);
    mockFrom.mockReturnValueOnce(usersChain);

    const deleteChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
    mockFrom.mockReturnValueOnce({
      delete: vi.fn(() => deleteChain),
    });
  };

  it('deletes notice and revalidates', async () => {
    setupDeleteNoticeTest();

    await deleteNotice('n999');

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockFrom).toHaveBeenCalledWith('notices');
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('throws if community_id is missing', async () => {
    setupDeleteNoticeTest(null);

    await expect(deleteNotice('n1')).rejects.toThrow('ERROR_UNAUTHORIZED_COMMUNITY');
  });
});

// ==================== deleteMeeting ====================
describe('deleteMeeting', () => {
  const setupDeleteMeetingTest = (community_id = 'comm-1') => {
    const usersChain = createUsersQueryMock(community_id);
    mockFrom.mockReturnValueOnce(usersChain);

    const deleteChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
    mockFrom.mockReturnValueOnce({
      delete: vi.fn(() => deleteChain),
    });
  };

  it('deletes meeting and revalidates the path', async () => {
    setupDeleteMeetingTest();

    await deleteMeeting('m888');

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockFrom).toHaveBeenCalledWith('meetings');
    expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Notices');
  });

  it('handles deletion error', async () => {
    const usersChain = createUsersQueryMock();
    mockFrom.mockReturnValueOnce(usersChain);

    const deleteChain = {
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'foreign key' } }),
      }),
    };
    mockFrom.mockReturnValueOnce({
      delete: vi.fn(() => deleteChain),
    });

    await expect(deleteMeeting('m1')).rejects.toThrow('foreign key');
  });
});

// ==================== General mock checks ====================
describe('General mock chains', () => {
  it('createClient always returns the same mock', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    const client1 = await createClient();
    const client2 = await createClient();
    expect(client1).toBe(client2);
  });
});
