import { getCommunityInfo } from './getCommunityInfo';
import { UserNavbar } from './UserNavbar';

export default async function UserNavbarWrapper() {
  const community = await getCommunityInfo();

  return (
    <>
      <UserNavbar community={community} />
    </>
  );
}
