<script setup lang="ts">
import { TBadge, TButton, TCard, TGrid, TLink, TStack } from '@tessen-ui/vue';

const features = [
  { title: 'Un solo contrato', text: 'Las mismas props y accesibilidad en Vue y en React.' },
  { title: 'Tokens, no valores', text: 'Color, espaciado y movimiento salen de variables CSS.' },
  {
    title: 'Accesible de serie',
    text: 'Teclado, foco y lector de pantalla forman parte del componente.',
  },
];
const plans = [
  { name: 'Gratis', price: '0 €', items: ['1 proyecto', 'Comunidad'], featured: false },
  {
    name: 'Pro',
    price: '12 €',
    items: ['Proyectos ilimitados', 'Soporte prioritario'],
    featured: true,
  },
  {
    name: 'Equipo',
    price: '39 €',
    items: ['Roles y permisos', 'Registro de actividad'],
    featured: false,
  },
];
</script>

<template>
  <TStack gap="10">
    <header class="nav">
      <strong class="brand">Marca</strong>
      <nav aria-label="Principal">
        <TStack direction="horizontal" gap="5" align="center">
          <TLink href="#">Producto</TLink>
          <TLink href="#">Precios</TLink>
          <TLink href="#">Documentación</TLink>
          <TButton size="sm">Empezar</TButton>
        </TStack>
      </nav>
    </header>

    <section class="hero">
      <TBadge variant="solid" tone="brand">Novedad</TBadge>
      <h1 class="display">Construye interfaces coherentes, sin esfuerzo</h1>
      <p class="lead">
        Un sistema de diseño para Vue y React con un tema que cambia toda la aplicación en un
        instante.
      </p>
      <TStack direction="horizontal" gap="3" justify="center" wrap>
        <TButton size="lg">Probar gratis</TButton>
        <TButton size="lg" variant="outline">Ver la demo</TButton>
      </TStack>
    </section>

    <TGrid columns="3" gap="4" class="panes">
      <TCard v-for="f in features" :key="f.title" variant="outlined">
        <h3 class="card-title">{{ f.title }}</h3>
        <p class="muted">{{ f.text }}</p>
      </TCard>
    </TGrid>

    <section aria-labelledby="precios">
      <h2 id="precios" class="center">Precios sencillos</h2>
      <TGrid columns="3" gap="4" class="panes">
        <TCard v-for="p in plans" :key="p.name" :variant="p.featured ? 'elevated' : 'outlined'">
          <template #header>
            {{ p.name }} <TBadge v-if="p.featured" tone="brand">Popular</TBadge>
          </template>
          <p class="price">{{ p.price }}<small>/mes</small></p>
          <ul class="plain">
            <li v-for="i in p.items" :key="i">{{ i }}</li>
          </ul>
          <template #footer>
            <TButton :variant="p.featured ? 'primary' : 'outline'">Elegir {{ p.name }}</TButton>
          </template>
        </TCard>
      </TGrid>
    </section>
  </TStack>
</template>
