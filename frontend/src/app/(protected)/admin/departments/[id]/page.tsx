import { DepartmentDetailsPage } from '@/components/admin-department-pages';
import { use } from 'react';

export default function Page({ params }: IdParamProps) {
  const { id } = use(params);

  return <DepartmentDetailsPage id={id} />;
}