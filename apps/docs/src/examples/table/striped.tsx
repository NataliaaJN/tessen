import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeaderCell, TableRow } from '@tessen-ui/react';

export default function Example() {
  return (
    <Table striped>
      <TableCaption>Team</TableCaption>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell numeric>Seats</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Ada</TableCell>
          <TableCell numeric>12</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Grace</TableCell>
          <TableCell numeric>3</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
