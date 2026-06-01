import { RoleFormPage } from '@/components/admin-role-pages';
import { use } from 'react';

export default function Page({ params }: IdParamProps) {
  const { id } = use(params);

	return <RoleFormPage role="receptionist" mode="edit" id={id} />;
}
