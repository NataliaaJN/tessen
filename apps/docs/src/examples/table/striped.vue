<script setup lang="ts">
import { TTable, TTableBody, TTableCaption, TTableCell, TTableHead, TTableHeaderCell, TTableRow } from '@tessen-ui/vue';
</script>

<template>
  <TTable striped>
    <TTableCaption>Team</TTableCaption>
    <TTableHead>
      <TTableRow><TTableHeaderCell>Name</TTableHeaderCell><TTableHeaderCell numeric>Seats</TTableHeaderCell></TTableRow>
    </TTableHead>
    <TTableBody>
      <TTableRow><TTableCell>Ada</TTableCell><TTableCell numeric>12</TTableCell></TTableRow>
      <TTableRow><TTableCell>Grace</TTableCell><TTableCell numeric>3</TTableCell></TTableRow>
    </TTableBody>
  </TTable>
</template>
