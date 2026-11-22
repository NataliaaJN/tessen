import { List, ListItem, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="6">
      <List variant="divided" style={{ inlineSize: 200 }}>
        <ListItem>Apples</ListItem>
        <ListItem>Pears</ListItem>
      </List>
      <List variant="bulleted" ordered>
        <ListItem>One</ListItem>
        <ListItem>Two</ListItem>
      </List>
    </Stack>
  );
}
