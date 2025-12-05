import { getCommunityInfo } from './getCommunityInfo';
import { AdminNavbar } from './AdminNavbar';

export default async function AdminNavbarWrapper() {
  const community = await getCommunityInfo();

  return (
    <>
      <AdminNavbar community={community} />
    </>
  );
}
