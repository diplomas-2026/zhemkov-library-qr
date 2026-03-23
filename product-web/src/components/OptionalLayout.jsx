import Layout from './Layout';
import PublicLayout from './PublicLayout';
import { getUser } from '../lib/auth';

export default function OptionalLayout({ children }) {
  const user = getUser();
  if (user) return <Layout>{children}</Layout>;
  return <PublicLayout>{children}</PublicLayout>;
}

