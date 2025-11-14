import LoginForm from "@/app/(authentication)/login/login";
import { SearchParams } from "@/types/next";

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { callbackUrl } = searchParams;

  const getCallbackUrl = () =>
    Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl ?? "/";

  return (
    <div>
      <LoginForm
        callbackUrl={getCallbackUrl()}
        hasCallbackParam={!!callbackUrl}
      />
    </div>
  );
}
