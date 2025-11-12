import { Col, Row } from "react-bootstrap";
import Link from "next/link";
import LoginForm from "@/app/(authentication)/login/login";
import { SearchParams } from "@/types/next";
import { getDictionary } from "@/locales/dictionary";

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { callbackUrl } = searchParams;
  const dict = await getDictionary();

  const getCallbackUrl = () =>
    Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl ?? "/";

  return (
    <div>
      <LoginForm callbackUrl={getCallbackUrl()} />
    </div>
  );
}
