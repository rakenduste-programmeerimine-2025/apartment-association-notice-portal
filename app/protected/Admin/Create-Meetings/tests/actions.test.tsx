import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMeeting } from '../actions';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockSupabaseAuth = {
  getUser: vi.fn(),
};

const mockSupabaseFrom = vi.fn();

const mockSupabase = {
  auth: mockSupabaseAuth,
  from: mockSupabaseFrom,
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}));

function createFormData(data: Record<string, string | null>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSupabaseAuth.getUser.mockResolvedValue({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    },
  });
});

describe('actions Create-Meeting', () => {
  describe('Valid Meeting Creation', () => {
    it('successfully creates a meeting with all valid data', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Team Meeting',
        description: 'Discuss project progress',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).resolves.not.toThrow();
    });

    it('accepts meeting without description', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: null,
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).resolves.not.toThrow();
    });
  });

  describe('Sanitization', () => {
    it('removes HTML tags from sanitized inputs', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: '<b>Bold</b> Meeting',
        description: '<strong>Important:</strong> Details',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await createMeeting(formData);

      const insertCall = mockSupabaseFrom().insert.mock.calls[0][0];
      expect(insertCall.title).toBe('Bold Meeting');
      expect(insertCall.description).toBe('Important: Details');
    });

    it('trims whitespace from title and description', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: '  Test Meeting  ',
        description: '  Test description  ',
        date: futureDate,
        time: '10:00',
        duration: '  1 hour  ',
      });

      await createMeeting(formData);

      const insertCall = mockSupabaseFrom().insert.mock.calls[0][0];
      expect(insertCall.title).toBe('Test Meeting');
      expect(insertCall.description).toBe('Test description');
      expect(insertCall.duration).toBe('1 hour');
    });
  });

  describe('Database & Supabase Integration', () => {
    it('throws ERROR_UNAUTHORIZED when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_UNAUTHORIZED');
    });

    it('throws ERROR_FETCHING_PROFILE when user profile query fails', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_FETCHING_PROFILE');
    });

    it('throws ERROR_USER_HAS_NO_COMMUNITY when user has no assigned community', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: null },
          error: null,
        }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_USER_HAS_NO_COMMUNITY');
    });

    it('throws ERROR_DB_INSERT_FAILED when meeting insert fails', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: vi.fn().mockResolvedValue({
          error: new Error('Insert failed'),
        }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_DB_INSERT_FAILED');
    });

    it('inserts meeting with correct data structure', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: insertMock,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Team Standup',
        description: 'Daily team sync',
        date: futureDate,
        time: '09:00',
        duration: '30 minutes',
      });

      await createMeeting(formData);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Team Standup',
          description: 'Daily team sync',
          duration: '30 minutes',
          created_by: 'test-user-id',
          community_id: 'test-community-id',
          meeting_date: expect.any(String),
        })
      );
    });

    it('filters meeting to the correct community based on user profile', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const selectMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockReturnThis();

      mockSupabaseFrom.mockReturnValue({
        select: selectMock,
        eq: eqMock,
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'community-building-789' },
          error: null,
        }),
        insert: insertMock,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Building Meeting',
        description: 'For building 789',
        date: futureDate,
        time: '15:00',
        duration: '1.5 hours',
      });

      await createMeeting(formData);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          community_id: 'community-building-789',
        })
      );

      expect(eqMock).toHaveBeenCalledWith('id', 'test-user-id');
    });

    it('correctly converts date and time to ISO format', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: insertMock,
      });

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: '2025-12-25',
        time: '14:30',
        duration: '1 hour',
      });

      await createMeeting(formData);

      const insertedData = insertMock.mock.calls[0][0];
      expect(insertedData.meeting_date).toContain('2025-12-25');
      expect(new Date(insertedData.meeting_date)).toBeInstanceOf(Date);

      const meetingDate = new Date(insertedData.meeting_date);
      expect(meetingDate.getHours()).toBe(14);
      expect(meetingDate.getMinutes()).toBe(30);
    });

    it('revalidates path after successful creation', async () => {
      const { revalidatePath } = await import('next/cache');

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await createMeeting(formData);

      expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Create-Meetings');
    });

    it('inserts into the correct "meetings" table', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'test-community-id' },
          error: null,
        }),
        insert: insertMock,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await createMeeting(formData);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('meetings');
      expect(insertMock).toHaveBeenCalledOnce();
    });
  });

  describe('Error Handling', () => {
    it('wraps non-Error exceptions as ERROR_UNKNOWN', async () => {
      mockSupabaseAuth.getUser.mockRejectedValueOnce('String error');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_UNKNOWN');
    });

    it('preserves Error instances when thrown', async () => {
      mockSupabaseAuth.getUser.mockRejectedValueOnce(new Error('ERROR_CUSTOM'));

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test description',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_CUSTOM');
    });
  });

  describe('Complete Flow', () => {
    it('successfully creates meeting from start to finish', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      const { revalidatePath } = await import('next/cache');

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { community_id: 'community-456' },
          error: null,
        }),
        insert: insertMock,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Project Planning',
        description: 'Q1 planning session',
        date: futureDate,
        time: '14:00',
        duration: '2 hours',
      });

      await expect(createMeeting(formData)).resolves.not.toThrow();

      expect(insertMock).toHaveBeenCalledOnce();
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Project Planning',
          description: 'Q1 planning session',
          duration: '2 hours',
          created_by: 'test-user-id',
          community_id: 'community-456',
          meeting_date: expect.any(String),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Create-Meetings');
    });

    it('rejects meeting when user is not authenticated', async () => {
      mockSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_UNAUTHORIZED');
    });

    it('rejects meeting when user lacks community assignment', async () => {
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().split('T')[0];

      const formData = createFormData({
        title: 'Test Meeting',
        description: 'Test',
        date: futureDate,
        time: '10:00',
        duration: '1 hour',
      });

      await expect(createMeeting(formData)).rejects.toThrow('ERROR_USER_HAS_NO_COMMUNITY');
    });
  });
});
