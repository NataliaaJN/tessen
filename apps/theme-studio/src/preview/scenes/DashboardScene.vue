<script setup lang="ts">
import {
  TAvatar,
  TBadge,
  TButton,
  TCard,
  TGrid,
  TProgress,
  TStack,
  TTable,
  TTableBody,
  TTableCaption,
  TTableCell,
  TTableHead,
  TTableHeaderCell,
  TTableRow,
} from '@tessen-ui/vue';

const kpis = [
  { label: 'Ingresos', value: '48.230 €', delta: '+12 %', tone: 'success' as const },
  { label: 'Pedidos', value: '1.284', delta: '+4 %', tone: 'success' as const },
  { label: 'Devoluciones', value: '37', delta: '+9 %', tone: 'danger' as const },
  { label: 'Satisfacción', value: '4,8', delta: '=', tone: 'neutral' as const },
];
const rows = [
  { who: 'Ada Lovelace', plan: 'Equipo', seats: 12, state: 'Activo', tone: 'success' as const },
  { who: 'Grace Hopper', plan: 'Pro', seats: 3, state: 'Pendiente', tone: 'warning' as const },
  { who: 'Alan Turing', plan: 'Gratis', seats: 1, state: 'Suspendido', tone: 'danger' as const },
  {
    who: 'Margaret Hamilton',
    plan: 'Equipo',
    seats: 24,
    state: 'Activo',
    tone: 'success' as const,
  },
];
</script>

<template>
  <TStack gap="6">
    <TStack direction="horizontal" justify="between" align="center" wrap gap="3">
      <div>
        <h1 class="page-title">Resumen</h1>
        <p class="muted">Últimos 30 días</p>
      </div>
      <TStack direction="horizontal" gap="2">
        <TButton variant="outline">Exportar</TButton>
        <TButton>Nuevo informe</TButton>
      </TStack>
    </TStack>

    <TGrid columns="4" gap="4" class="kpis">
      <TCard v-for="k in kpis" :key="k.label" variant="outlined">
        <p class="muted">{{ k.label }}</p>
        <p class="kpi">{{ k.value }}</p>
        <TBadge :tone="k.tone">{{ k.delta }}</TBadge>
      </TCard>
    </TGrid>

    <TGrid columns="2" gap="4" class="panes">
      <TCard variant="outlined">
        <template #header>Objetivos del trimestre</template>
        <TStack gap="4">
          <TProgress aria-label="Ventas" :value="72" />
          <TProgress aria-label="Retención" tone="success" :value="88" />
          <TProgress aria-label="Soporte" tone="danger" :value="31" />
        </TStack>
      </TCard>
      <TCard variant="outlined">
        <template #header>Equipo</template>
        <TStack gap="3">
          <TStack v-for="r in rows" :key="r.who" direction="horizontal" gap="3" align="center">
            <TAvatar :name="r.who" size="sm" />
            <span>{{ r.who }}</span>
          </TStack>
        </TStack>
      </TCard>
    </TGrid>

    <TTable striped>
      <TTableCaption>Cuentas recientes</TTableCaption>
      <TTableHead>
        <TTableRow>
          <TTableHeaderCell>Cliente</TTableHeaderCell>
          <TTableHeaderCell>Plan</TTableHeaderCell>
          <TTableHeaderCell numeric>Puestos</TTableHeaderCell>
          <TTableHeaderCell>Estado</TTableHeaderCell>
        </TTableRow>
      </TTableHead>
      <TTableBody>
        <TTableRow v-for="r in rows" :key="r.who">
          <TTableCell>{{ r.who }}</TTableCell>
          <TTableCell>{{ r.plan }}</TTableCell>
          <TTableCell numeric>{{ r.seats }}</TTableCell>
          <TTableCell
            ><TBadge :tone="r.tone">{{ r.state }}</TBadge></TTableCell
          >
        </TTableRow>
      </TTableBody>
    </TTable>
  </TStack>
</template>
