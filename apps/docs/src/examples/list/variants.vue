<script setup lang="ts">
import { TList, TListItem, TStack } from '@tessen-ui/vue';
</script>

<template>
  <TStack direction="horizontal" gap="6">
    <TList variant="divided" style="inline-size: 200px"><TListItem>Apples</TListItem><TListItem>Pears</TListItem></TList>
    <TList variant="bulleted" ordered><TListItem>One</TListItem><TListItem>Two</TListItem></TList>
  </TStack>
</template>
