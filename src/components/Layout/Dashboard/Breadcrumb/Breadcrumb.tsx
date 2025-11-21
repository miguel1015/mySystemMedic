import { Breadcrumb as BSBreadcrumb, BreadcrumbItem } from "react-bootstrap";
import { getDictionary } from "@/locales/dictionary";

export default async function Breadcrumb() {
  const dict = await getDictionary();
  return (
    <BSBreadcrumb listProps={{ className: "mb-0 align-items-center" }}>
      <BreadcrumbItem
        linkProps={{ className: "text-decoration-none" }}
        href="/"
      >
        {dict.general.breadcrumb.home}
      </BreadcrumbItem>
      <BreadcrumbItem
        linkProps={{ className: "text-decoration-none" }}
        href="/"
      >
        {dict.general.breadcrumb.library}
      </BreadcrumbItem>
      <BreadcrumbItem active>{dict.general.breadcrumb.data}</BreadcrumbItem>
    </BSBreadcrumb>
  );
}
