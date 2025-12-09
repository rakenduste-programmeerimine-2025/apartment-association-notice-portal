import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getNotices,
  getMeetings,
  toggleNoticeLike,
} from "@/app/protected/Resident/Notices/actions";

// ------------------------------
// GLOBAL MOCK: createClient
// ------------------------------
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";

describe("ACTIONS — EXTENDED TEST SUITE (FULL VERSION)", () => {
  let supabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    supabase = {
      auth: { getUser: vi.fn() },
      from: vi.fn(),
    };
    (createClient as any).mockResolvedValue(supabase);
  });

  // -------------------------------------------------------------------------
  // GET NOTICES — AUTH CASES
  // -------------------------------------------------------------------------
  describe("getNotices — authentication", () => {
    it("returns empty when user is not authenticated", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const r = await getNotices();
      expect(r).toEqual({ data: [], count: 0 });
    });

    it("returns empty when profile has no community_id", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null }),
      });
      const r = await getNotices();
      expect(r.data).toEqual([]);
      expect(r.count).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // GET NOTICES — BASIC DATA
  // -------------------------------------------------------------------------
  describe("getNotices — basic fetch", () => {
    it("returns data with likesCount + hasLiked", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [
              {
                id: "N1",
                title: "Notice1",
                content: "Content1",
                category: "General",
                created_at: "2024-01-01T00:00:00.000Z",
                likesnotice: [
                  { id: 1, user_id: "user-1" },
                  { id: 2, user_id: "user-2" },
                ],
              },
            ],
            count: 1,
          }),
        });

      const r = await getNotices();
      expect(r.data[0].likesCount).toBe(2);
      expect(r.data[0].hasLiked).toBe(true);
    });

    it("returns multiple notices correctly", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-2" } } });
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [
              { id: "N1", likesnotice: [{ id: 1, user_id: "user-1" }] },
              { id: "N2", likesnotice: [{ id: 2, user_id: "user-2" }] },
            ],
            count: 2,
          }),
        });

      const r = await getNotices();
      expect(r.data.length).toBe(2);
      expect(r.data[1].hasLiked).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // GET NOTICES — CATEGORY & SORT
  // -------------------------------------------------------------------------
  describe("getNotices — filtering & sorting", () => {
    it("adds eq(category) when category filter is provided", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });

      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockReturnThis(),
              range: vi.fn().mockResolvedValue({ data: [], count: 0 }),
            })),
          })),
        });

      await getNotices(1, 3, "Maintenance", "newest");
      const calls = supabase.from.mock.calls;
      expect(calls[1][0]).toBe("notices");
    });

    it("sort=oldest triggers ascending=true", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });
      const order = vi.fn().mockReturnThis();

      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order,
          range: vi.fn().mockResolvedValue({ data: [], count: 0 }),
        });

      await getNotices(1, 3, "", "oldest");
      expect(order).toHaveBeenCalledWith("created_at", { ascending: true });
    });
  });

  // -------------------------------------------------------------------------
  // GET NOTICES — PAGINATION
  // -------------------------------------------------------------------------
  describe("getNotices — pagination", () => {
    it("calculates correct range for page=3 limit=3", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });

      const range = vi.fn().mockResolvedValue({ data: [], count: 0 });
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range,
        });

      await getNotices(3, 3, "", "newest");
      expect(range).toHaveBeenCalledWith(6, 8);
    });
  });

  // -------------------------------------------------------------------------
  // GET NOTICES — ERROR HANDLING
  // -------------------------------------------------------------------------
  describe("getNotices — error handling", () => {
    it("returns empty on thrown error", async () => {
      supabase.auth.getUser.mockRejectedValue(new Error("Fail"));
      const r = await getNotices();
      expect(r.data).toEqual([]);
      expect(r.count).toBe(0);
    });

    it("returns empty when query.range throws", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockRejectedValue(new Error("Query error")),
        });

      const r = await getNotices();
      expect(r.data).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
// GET MEETINGS — EXTENDED CASES
// -------------------------------------------------------------------------
describe("getMeetings — extended cases", () => {
  it("returns empty if user is null", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const r = await getMeetings();
    expect(r).toEqual([]);
  });

  it("returns empty on error", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(new Error("DB fail")),
    });
    const r = await getMeetings();
    expect(r).toEqual([]);
  });

  // 
  it("returns empty array if community_id is missing", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });
    supabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }), // нет community_id
    });
    const r = await getMeetings();
    expect(r).toEqual([]);
  });
});

  // -------------------------------------------------------------------------
  // TOGGLE NOTICE LIKE — BASIC & EDGE CASES
  // -------------------------------------------------------------------------
  describe("toggleNoticeLike — like/unlike flow", () => {
    beforeEach(() => supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } }));

    it("throws when not authenticated", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      await expect(toggleNoticeLike("N1")).rejects.toThrow("Not authenticated");
    });

    it("inserts like when not existing", async () => {
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
        })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ data: null, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnValue(Promise.resolve({ count: 1 })) });

      const r = await toggleNoticeLike("N1");
      expect(r.liked).toBe(true);
      expect(r.likesCount).toBe(1);
    });

    it("deletes like when exists", async () => {
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: "L1" }, error: null }),
        })
        .mockReturnValueOnce({ delete: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnValue(Promise.resolve({ count: 0 })) });

      const r = await toggleNoticeLike("N1");
      expect(r.liked).toBe(false);
      expect(r.likesCount).toBe(0);
    });

    it("handles multiple likes from different users", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U2" } } });
      supabase.from
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null }) })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ data: null, error: null }) })
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnValue(Promise.resolve({ count: 3 })) });

      const r = await toggleNoticeLike("N2");
      expect(r.likesCount).toBe(3);
    });

    it("handles error on insert/delete gracefully", async () => {
      supabase.from
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null }) })
        .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ data: null, error: { message: "Fail" } }) });

      await expect(toggleNoticeLike("N3")).rejects.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // ADDITIONAL EDGE CASES — NOTICES
  // -------------------------------------------------------------------------
  describe("additional edge cases — getNotices", () => {
    it("handles empty array correctly", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U1" } } });
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnThis(), range: vi.fn().mockResolvedValue({ data: [], count: 0 }) });

      const r = await getNotices();
      expect(r.data).toEqual([]);
    });

    it("handles multiple likes with mixed users", async () => {
      supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "U3" } } });
      supabase.from
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { community_id: "C1" } }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [
              { id: "N2", likesnotice: [{ id: 1, user_id: "U1" }, { id: 2, user_id: "U2" }] },
              { id: "N3", likesnotice: [] },
            ],
            count: 2,
          }),
        });

      const r = await getNotices();
      expect(r.data[0].likesCount).toBe(2);
      expect(r.data[0].hasLiked).toBe(false);
      expect(r.data[1].likesCount).toBe(0);
    });
  });
});
