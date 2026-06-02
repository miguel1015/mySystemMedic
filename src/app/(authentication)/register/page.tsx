import { Card, CardBody, Col, Row } from "react-bootstrap";
import Register from "@/app/(authentication)/register/register";
import { getDictionary } from "@/locales/dictionary";

export default async function Page() {
  const dict = await getDictionary();

  return (
    <div
      className="d-flex align-items-center justify-content-center px-3"
      style={{ minHeight: "100vh", background: "var(--dash-bg, #f4f7f6)" }}
    >
      <Row className="justify-content-center w-100">
        <Col md={6} lg={5} xl={4}>
          <Card
            className="mb-0"
            style={{ borderRadius: "var(--radius-xl, 22px)", boxShadow: "var(--dash-shadow-lg)" }}
          >
            <CardBody className="p-4 p-md-5">
              <h1 className="h3 mb-1">{dict.general.signup.title}</h1>
              <p className="text-black-50 dark:text-gray-500 mb-4">
                {dict.general.signup.description}
              </p>
              <Register />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
