import { redirect } from 'next/navigation';
import { getUsersAction } from '../../../features/users/actions/user-actions';
import { UsersList } from '../../../features/users/components/users-list';
import { AuthenticationError, AuthorizationError } from '../../../lib/errors';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  let users;
  try {
    users = await getUsersAction();
  } catch (err) {
    if (err instanceof AuthenticationError) {
      redirect('/login?callbackUrl=/users');
    }
    if (err instanceof AuthorizationError) {
      redirect('/dashboard');
    }
    throw err;
  }

  return <UsersList initialUsers={users} />;
}
