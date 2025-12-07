import '@/app/api/register/tests/mocks'; 
import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('POST /api/register', () => {
  it('returns 400 if required fields missing', async () => {
    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: '',
        password: '',
        fullName: '',
        flatNumber: '',
        ads_oid: '',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Missing required fields');
  });

  it('returns 200 when all required fields provided', async () => {
    const req = new Request('http://localhost/api/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'Test1234',
        fullName: 'John Doe',
        flatNumber: '12',
        ads_oid: 'ads123',
        full_address: 'street 1',
        streetName: 'street',
        houseNumber: '1',
        city: 'Tallinn',
        country: 'Estonia',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe('User registered successfully');
    expect(json.communityCreated).toBe(true);
    expect(json.communityId).toBeDefined();
  });
});
