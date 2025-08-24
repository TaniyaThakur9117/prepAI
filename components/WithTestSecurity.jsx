"use client";
import TestLayout from "./TestLayout";

export default function withTestSecurity(Component) {
  return function SecuredPage(props) {
    return (
      <TestLayout>
        <Component {...props} />
      </TestLayout>
    );
  };
}