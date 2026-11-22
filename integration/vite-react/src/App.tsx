// Uses only the public entry points. The contract cases and `defineContract` are NOT used here
// on purpose: the build check asserts they are tree-shaken out of the bundle.
import { CheckIcon } from '@tessen-ui/icons/react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@tessen-ui/react';
import { useState } from 'react';

export function App() {
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  return (
    <Stack gap="4">
      <Tabs>
        <TabList aria-label="Sections">
          <Tab value="account">Account</Tab>
          <Tab value="billing">Billing</Tab>
        </TabList>
        <TabPanel value="account">
          <Field invalid={email === ''} required>
            <FieldLabel>Email</FieldLabel>
            <Input value={email} onValueChange={setEmail} type="email" />
            <FieldDescription>We never share it.</FieldDescription>
            <FieldError>Required</FieldError>
          </Field>
          <Checkbox checked={accepted} onCheckedChange={setAccepted}>
            Accept the terms
          </Checkbox>
        </TabPanel>
        <TabPanel value="billing">
          <Alert tone="info" title="Heads up">
            Billing is read-only.
          </Alert>
        </TabPanel>
      </Tabs>

      <Button tone="danger" block leadingIcon={<CheckIcon size={16} />}>
        Save
      </Button>

      <Dialog>
        <DialogTrigger>Delete account</DialogTrigger>
        <DialogContent>
          <DialogTitle>Delete account?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
