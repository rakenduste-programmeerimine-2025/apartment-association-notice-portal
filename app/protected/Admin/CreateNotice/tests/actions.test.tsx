import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNotice } from '../actions';
import { revalidatePath } from 'next/cache';

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

const mockSupabase = {
  auth: {
    getUser: mockGetUser,
  },
  from: mockFrom,
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

function createFormData(values: Record<string, string | null>) {
  const fd = new FormData();
  for (const [key, val] of Object.entries(values)) {
    if (val !== null) fd.append(key, val);
  }
  return fd;
}

function setupSelectChain() {
  mockFrom.mockReturnValue({
    select: mockSelect,
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    single: mockSingle,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSelect.mockReset();
  mockEq.mockReset();
  mockSingle.mockReset();
  mockInsert.mockReset();
  mockFrom.mockReset();

  mockGetUser.mockResolvedValue({
    data: { user: { id: 'test-user-id' } },
  });

  setupSelectChain();
});

describe('actions Create-Notice', () => {
  describe('Validation', () => {
    it('throws ERROR_INVALID_CONTENT when content is missing', async () => {
      const fd = new FormData();
      fd.append('title', 'Hello');
      fd.append('category', 'General');

      await expect(createNotice(fd)).rejects.toThrow('ERROR_INVALID_CONTENT');
    });

    it('throws ERROR_INVALID_TITLE when title is missing', async () => {
      const fd = new FormData();
      fd.append('content', 'Hello');
      fd.append('category', 'General');

      await expect(createNotice(fd)).rejects.toThrow('ERROR_INVALID_TITLE');
    });

    it('throws ERROR_INVALID_CATEGORY when category missing', async () => {
      const formData = createFormData({
        title: 'Test',
        content: 'Content',
        category: null,
      });

      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin', community_id: 'community-123' },
        error: null,
      });

      await expect(createNotice(formData)).rejects.toThrow('ERROR_INVALID_CATEGORY');
    });
  });

  describe('Sanitization', () => {
    it('strips HTML tags from title, content, and category', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle.mockResolvedValue({
          data: { role: 'admin', community_id: 'COMM1' },
          error: null,
        }),
      });

      mockFrom.mockReturnValueOnce({
        insert: insertMock,
      });

      const fd = createFormData({
        title: '<b>Hello</b>',
        content: '<script>bad()</script> world',
        category: '<i>General</i>',
      });

      await createNotice(fd);

      const inserted = insertMock.mock.calls[0][0];
      expect(inserted.title).toBe('Hello');
      expect(inserted.content).toBe('bad() world');
      expect(inserted.category).toBe('General');
    });

    it('trims whitespace', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle.mockResolvedValue({
          data: { role: 'admin', community_id: 'C1' },
          error: null,
        }),
      });

      mockFrom.mockReturnValueOnce({
        insert: insertMock,
      });

      const fd = createFormData({
        title: '   Title   ',
        content: '   Content   ',
        category: '   Safety   ',
      });

      await createNotice(fd);

      const payload = insertMock.mock.calls[0][0];
      expect(payload.title).toBe('Title');
      expect(payload.content).toBe('Content');
      expect(payload.category).toBe('Safety');
    });
  });

  describe('Auth & Role Checks', () => {
    it('throws ERROR_UNAUTHORIZED when no user', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null } });

      const fd = createFormData({
        title: 'T',
        content: 'C',
        category: 'General',
      });

      await expect(createNotice(fd)).rejects.toThrow('ERROR_UNAUTHORIZED');
    });

    it('throws ERROR_FETCHING_PROFILE when profile fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: new Error('DB fail'),
      });

      const fd = createFormData({
        title: 'T',
        content: 'C',
        category: 'General',
      });

      await expect(createNotice(fd)).rejects.toThrow('ERROR_FETCHING_PROFILE');
    });

    it('throws ERROR_FORBIDDEN when user is not admin', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { role: 'user', community_id: 'C1' },
        error: null,
      });

      const fd = createFormData({
        title: 'T',
        content: 'C',
        category: 'General',
      });

      await expect(createNotice(fd)).rejects.toThrow('ERROR_FORBIDDEN');
    });

    it('throws ERROR_NO_COMMUNITY for falsy community ids', async () => {
      const falsy = [null, '', undefined];

      for (const val of falsy) {
        mockSingle.mockResolvedValueOnce({
          data: { role: 'admin', community_id: val },
          error: null,
        });

        const fd = createFormData({
          title: 'A',
          content: 'B',
          category: 'General',
        });

        await expect(createNotice(fd)).rejects.toThrow('ERROR_NO_COMMUNITY');

        mockSingle.mockReset();
      }
    });
  });

  describe('Insert & DB Errors', () => {
    it('throws ERROR_INSERT_FAILED when insert fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin', community_id: 'C1' },
        error: null,
      });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockFrom.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: new Error('Insert fail') }),
      });

      const fd = createFormData({
        title: 'T',
        content: 'C',
        category: 'General',
      });

      await expect(createNotice(fd)).rejects.toThrow('ERROR_INSERT_FAILED');
    });

    it('inserts correct structure', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin', community_id: 'COMM-77' },
        error: null,
      });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockFrom.mockReturnValueOnce({
        insert: insertMock,
      });

      const fd = createFormData({
        title: 'X',
        content: 'Y',
        category: 'General',
      });

      await createNotice(fd);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'X',
          content: 'Y',
          category: 'General',
          created_by: 'test-user-id',
          community_id: 'COMM-77',
        })
      );
    });

    it('inserts into notices table', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin', community_id: 'C1' },
        error: null,
      });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockFrom.mockReturnValueOnce({
        insert: insertMock,
      });

      const fd = createFormData({
        title: 'A',
        content: 'B',
        category: 'General',
      });

      await createNotice(fd);

      expect(mockFrom).toHaveBeenNthCalledWith(2, 'notices');
    });
  });

  describe('Query Semantics', () => {
    it('queries users with correct fields', async () => {
      mockSingle
        .mockResolvedValueOnce({ data: { role: 'admin', community_id: 'C1' }, error: null })
        .mockResolvedValueOnce({ error: null });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockFrom.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      const fd = createFormData({
        title: 'X',
        content: 'Y',
        category: 'General',
      });

      await createNotice(fd);

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('id, role, community_id');
      expect(mockEq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });
  });

  describe('System Integration', () => {
    it('revalidates correct path', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSingle
        .mockResolvedValueOnce({ data: { role: 'admin', community_id: 'C1' }, error: null })
        .mockResolvedValueOnce({ error: null });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockFrom.mockReturnValueOnce({
        insert: insertMock,
      });

      const fd = createFormData({
        title: 'T',
        content: 'C',
        category: 'General',
      });

      await createNotice(fd);

      expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Notices');
    });
  });

  describe('Error Handling', () => {
    it('wraps non Error into ERROR_UNKNOWN', async () => {
      mockGetUser.mockRejectedValueOnce('oops');

      const fd = createFormData({
        title: 'T',
        content: 'C',
        category: 'General',
      });

      await expect(createNotice(fd)).rejects.toThrow('ERROR_UNKNOWN');
    });

    it('preserves native Error instance', async () => {
      mockGetUser.mockRejectedValueOnce(new Error('ERR_CUSTOM'));

      const fd = createFormData({
        title: 'T',
        content: 'C',
        category: 'General',
      });

      await expect(createNotice(fd)).rejects.toThrow('ERR_CUSTOM');
    });
  });

 
  describe('Full Flow', () => {
    it('creates notice from start to finish successfully', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });

      mockSingle
        .mockResolvedValueOnce({ data: { role: 'admin', community_id: 'C1' }, error: null })
        .mockResolvedValueOnce({ error: null });

      mockFrom.mockReturnValueOnce({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      mockFrom.mockReturnValueOnce({
        insert: insertMock,
      });

      const fd = createFormData({
        title: 'Announcement',
        content: 'Meeting Tomorrow',
        category: 'General',
      });

      await expect(createNotice(fd)).resolves.not.toThrow();
      expect(insertMock).toHaveBeenCalledOnce();
      expect(revalidatePath).toHaveBeenCalledWith('/protected/Admin/Notices');
    });
  });
});
