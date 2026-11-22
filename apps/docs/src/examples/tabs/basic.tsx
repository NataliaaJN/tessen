import { Tabs, TabList, Tab, TabPanel } from '@tessen-ui/react';

export default function Example() {
  return (
    <Tabs defaultValue="b">
      <TabList aria-label="Sections">
        <Tab value="a">Account</Tab>
        <Tab value="b">Billing</Tab>
        <Tab value="c">Team</Tab>
      </TabList>
      <TabPanel value="a">Account panel</TabPanel>
      <TabPanel value="b">Billing panel</TabPanel>
      <TabPanel value="c">Team panel</TabPanel>
    </Tabs>
  );
}
