import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@tessen-ui/react';

export default function Example() {
  return (
    <Accordion defaultValue={['one']} variant="bordered">
      <AccordionItem value="one">
        <AccordionTrigger>First</AccordionTrigger>
        <AccordionContent>First content</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second</AccordionTrigger>
        <AccordionContent>Second content</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
