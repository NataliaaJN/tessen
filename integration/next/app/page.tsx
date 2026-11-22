// A SERVER component using @tessen-ui/react directly: the package ships 'use client' (ADR 0004 C4),
// so no wrapper is needed. Everything below is rendered to HTML on the server and then hydrated.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Progress,
  Select,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@tessen-ui/react';
import { DialogOpenOnLoad } from './dialog-open-on-load';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];

export default function Page() {
  return (
    <main>
      <Stack gap="4">
        <h1>SSR consumer</h1>
        <Button tone="danger">Save</Button>
        <Tabs defaultValue="b">
          <TabList aria-label="Sections">
            <Tab value="a">First</Tab>
            <Tab value="b">Second</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </Tabs>
        <Select items={fruits} label="Fruit" defaultValue="banana" />
        <Accordion defaultValue={['one']}>
          <AccordionItem value="one">
            <AccordionTrigger>One</AccordionTrigger>
            <AccordionContent>Open on the server</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Progress value={40} aria-label="Upload" />
        <DialogOpenOnLoad />
      </Stack>
    </main>
  );
}
