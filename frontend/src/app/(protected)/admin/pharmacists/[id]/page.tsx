import { RoleDetailsPage } from '@/components/admin-role-pages';
import { use } from 'react';

export default function Page({ params }: IdParamProps) {
  const { id } = use(params);

	return <RoleDetailsPage role="pharmacist" id={id} />;
}
