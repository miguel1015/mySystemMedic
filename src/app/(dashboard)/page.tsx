import { getDictionary } from "@/locales/dictionary";

export default async function Page() {
  const dict = await getDictionary();

  return <div></div>;
}
