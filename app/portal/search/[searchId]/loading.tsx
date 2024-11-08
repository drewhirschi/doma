import React from "react";
import { CompaniesTable } from "../../companies/CompanyTable";

export default function Loading() {
  return (
    <div>
      <CompaniesTable companies={[]} loading />
    </div>
  );
}
