import LoginForm from './login-form';

export default async function LoginPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ google?: string }> }>) {
  const query = await searchParams;
  return <LoginForm googleError={query.google === 'error'} />;
}
