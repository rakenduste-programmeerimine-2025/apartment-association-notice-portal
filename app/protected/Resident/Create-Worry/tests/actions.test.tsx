import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWorry } from '../actions';
import { revalidatePath } from 'next/cache';

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
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

function makeForm(title: any, content: any) {
  const fd = new FormData();
  if (title !== undefined) fd.append('title', title);
  if (content !== undefined) fd.append('content', content);
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

  mockGetUser.mockReset();
  mockFrom.mockReset();
  mockSelect.mockReset();
  mockEq.mockReset();
  mockSingle.mockReset();

  setupSelectChain();
});

describe('actions Create-Worry', () => {
  it('throws ERROR_INVALID_TITLE if title is not a string', async () => {
    const fd = makeForm(undefined as any, 'abc');
    await expect(createWorry(fd)).rejects.toThrow('ERROR_INVALID_TITLE');
  });

  it('throws ERROR_NO_TITLE when sanitized title is empty', async () => {
    const fd = makeForm('   ', 'desc');
    await expect(createWorry(fd)).rejects.toThrow('ERROR_NO_TITLE');
  });

  it('throws ERROR_TITLE_TOO_LONG when title exceeds 120 chars', async () => {
    const fd = makeForm('a'.repeat(121), 'Description');
    await expect(createWorry(fd)).rejects.toThrow('ERROR_TITLE_TOO_LONG');
  });

  it('throws ERROR_CONTENT_TOO_LONG when content exceeds 1200 chars', async () => {
    const fd = makeForm('Title', 'a'.repeat(1201));
    await expect(createWorry(fd)).rejects.toThrow('ERROR_CONTENT_TOO_LONG');
  });

  it('sanitizes HTML from title and content before inserting', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle
      .mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null })
      .mockResolvedValueOnce({ error: null });

    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: insertMock,
    });

    const fd = makeForm('<b>Hello</b>', '<i>World</i>');

    await createWorry(fd);

    const inserted = insertMock.mock.calls[0][0];

    expect(inserted.title).toBe('Hello');
    expect(inserted.content).toBe('World');
  });

  it('trims whitespace from fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle
      .mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null })
      .mockResolvedValueOnce({ error: null });

    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: insertMock,
    });

    const fd = makeForm('   Title  ', '   Content   ');

    await createWorry(fd);

    const inserted = insertMock.mock.calls[0][0];

    expect(inserted.title).toBe('Title');
    expect(inserted.content).toBe('Content');
  });

  it('throws ERROR_UNAUTHORIZED when auth user is missing', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: null } });

    await expect(createWorry(fd)).rejects.toThrow('ERROR_UNAUTHORIZED');
  });

  it('throws ERROR_FETCHING_PROFILE when profile query fails', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'err' } });

    await expect(createWorry(fd)).rejects.toThrow('ERROR_FETCHING_PROFILE');
  });

  it('throws ERROR_USER_HAS_NO_COMMUNITY when community_id is null', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle.mockResolvedValueOnce({ data: { community_id: null }, error: null });

    await expect(createWorry(fd)).rejects.toThrow('ERROR_USER_HAS_NO_COMMUNITY');
  });

  it('throws ERROR_USER_HAS_NO_COMMUNITY when community_id is empty string', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle.mockResolvedValueOnce({ data: { community_id: '' }, error: null });

    await expect(createWorry(fd)).rejects.toThrow('ERROR_USER_HAS_NO_COMMUNITY');
  });

  it('throws ERROR_DB_INSERT_FAILED when insert fails', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle.mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'failed' } }),
    });

    await expect(createWorry(fd)).rejects.toThrow('ERROR_DB_INSERT_FAILED');
  });

  it('inserts into worries table with correct payload', async () => {
    const fd = makeForm('Valid', 'Content');

    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle
      .mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null })
      .mockResolvedValueOnce({ error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: insertMock,
    });

    await createWorry(fd);

    const call = insertMock.mock.calls[0][0];

    expect(call).toEqual({
      title: 'Valid',
      content: 'Content',
      created_by: 'u1',
      community_id: 'c1',
    });
  });

  it('calls revalidatePath after successful insert', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle
      .mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null })
      .mockResolvedValueOnce({ error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    await createWorry(fd);

    expect(revalidatePath).toHaveBeenCalledWith('/protected/Resident/Create-Worry');
  });

  it('queries users table correctly', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    mockSingle
      .mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null })
      .mockResolvedValueOnce({ error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    await createWorry(fd);

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(mockSelect).toHaveBeenCalledWith('community_id');
    expect(mockEq).toHaveBeenCalledWith('id', 'u1');
  });

  it('queries worries table on insert', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

    mockSingle
      .mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null })
      .mockResolvedValueOnce({ error: null });

    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: insertMock,
    });

    await createWorry(fd);

    expect(mockFrom).toHaveBeenNthCalledWith(2, 'worries');
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it('wraps non Error exceptions into ERROR_UNKNOWN', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockImplementation(() => {
      throw 'weird';
    });

    await expect(createWorry(fd)).rejects.toThrow('ERROR_UNKNOWN');
  });

  it('preserves native Error message when thrown', async () => {
    const fd = makeForm('Valid', 'Content');

    mockGetUser.mockRejectedValueOnce(new Error('CUSTOM_ERR'));

    await expect(createWorry(fd)).rejects.toThrow('CUSTOM_ERR');
  });

  it('executes full successful flow', async () => {
    const fd = makeForm('Hello', 'World');

    const insertMock = vi.fn().mockResolvedValue({ error: null });

    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
    });

    mockSingle
      .mockResolvedValueOnce({ data: { community_id: 'c1' }, error: null })
      .mockResolvedValueOnce({ error: null });

    mockFrom.mockReturnValueOnce({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    mockFrom.mockReturnValueOnce({
      insert: insertMock,
    });

    await expect(createWorry(fd)).resolves.not.toThrow();

    expect(insertMock).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalled();
  });
});
