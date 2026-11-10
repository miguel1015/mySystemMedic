import LoginForm from "@/app/(authentication)/login/login";
import { SearchParams } from "@/types/next";

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { callbackUrl, reason } = searchParams;

  const getCallbackUrl = () =>
    Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl ?? "/";

  const rawReason = Array.isArray(reason) ? reason[0] : reason;
  const endReason = rawReason === "idle" || rawReason === "expired" ? rawReason : undefined;

  return (
    <div>
      <LoginForm
        callbackUrl={getCallbackUrl()}
        hasCallbackParam={!!callbackUrl}
        endReason={endReason}
      />
    </div>
  );
}
