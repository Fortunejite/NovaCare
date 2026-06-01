import { RoleFormPage } from '@/components/admin-role-pages';
import { use } from 'react';

export default function Page({ params }: IdParamProps) {
  const { id } = use(params);

	return <RoleFormPage role="doctor" mode="edit" id={id} />;
}
