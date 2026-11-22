import { BreadcrumbItem, Breadcrumbs } from '@tessen-ui/react';

export default function Example() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/components/">Components</BreadcrumbItem>
      <BreadcrumbItem current>Button</BreadcrumbItem>
    </Breadcrumbs>
  );
}
