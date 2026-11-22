<script setup lang="ts">
import {
  TAccordion,
  TAccordionContent,
  TAccordionItem,
  TAccordionTrigger,
  TAlert,
  TAvatar,
  TBadge,
  TBreadcrumbItem,
  TBreadcrumbs,
  TButton,
  TCard,
  TCheckbox,
  TDialog,
  TDialogClose,
  TDialogContent,
  TDialogDescription,
  TDialogTitle,
  TDialogTrigger,
  TInput,
  TPagination,
  TProgress,
  TRadio,
  TRadioGroup,
  TSlider,
  TStack,
  TSwitch,
  TTab,
  TTabList,
  TTabPanel,
  TTabs,
  TTooltip,
  TTooltipContent,
  TTooltipTrigger,
} from '@tessen-ui/vue';
</script>

<template>
  <TStack gap="6">
    <TBreadcrumbs>
      <TBreadcrumbItem href="#">Inicio</TBreadcrumbItem>
      <TBreadcrumbItem href="#">Proyectos</TBreadcrumbItem>
      <TBreadcrumbItem current>Rediseño</TBreadcrumbItem>
    </TBreadcrumbs>

    <section aria-labelledby="g-buttons">
      <h2 id="g-buttons" class="group">Botones</h2>
      <TStack direction="horizontal" gap="2" wrap align="center">
        <TButton>Principal</TButton>
        <TButton variant="secondary">Secundario</TButton>
        <TButton variant="outline">Contorno</TButton>
        <TButton variant="ghost">Fantasma</TButton>
        <TButton tone="danger">Eliminar</TButton>
        <TButton loading>Guardando</TButton>
        <TButton disabled>Desactivado</TButton>
        <TButton size="sm">Pequeño</TButton>
        <TButton size="lg">Grande</TButton>
      </TStack>
    </section>

    <section aria-labelledby="g-feedback">
      <h2 id="g-feedback" class="group">Estados y avisos</h2>
      <TStack gap="3">
        <TStack direction="horizontal" gap="2" wrap>
          <TBadge tone="neutral">Neutro</TBadge>
          <TBadge tone="brand">Marca</TBadge>
          <TBadge tone="success">Correcto</TBadge>
          <TBadge tone="warning">Aviso</TBadge>
          <TBadge tone="danger">Error</TBadge>
          <TBadge tone="info">Info</TBadge>
          <TBadge variant="solid" tone="brand">Sólido</TBadge>
          <TBadge variant="outline" tone="success">Contorno</TBadge>
        </TStack>
        <TAlert tone="info" title="Novedad">Ya puedes exportar tu tema a Tailwind.</TAlert>
        <TAlert tone="success" title="Guardado">Los cambios están publicados.</TAlert>
        <TAlert tone="warning" title="Atención">Esto afecta a otras personas del equipo.</TAlert>
        <TAlert tone="danger" title="No se pudo guardar"
          >Revisa tu conexión e inténtalo de nuevo.</TAlert
        >
      </TStack>
    </section>

    <section aria-labelledby="g-controls">
      <h2 id="g-controls" class="group">Controles</h2>
      <TStack gap="4">
        <TInput
          aria-label="Correo"
          type="email"
          placeholder="tu@correo.com"
          style="max-inline-size: 22rem"
        />
        <TInput
          aria-label="Con error"
          invalid
          default-value="valor incorrecto"
          style="max-inline-size: 22rem"
        />
        <TStack direction="horizontal" gap="4" wrap>
          <TCheckbox default-checked>Recordarme</TCheckbox>
          <TCheckbox indeterminate>Mixto</TCheckbox>
          <TSwitch default-checked>Notificaciones</TSwitch>
          <TSwitch disabled>Desactivado</TSwitch>
        </TStack>
        <TRadioGroup aria-label="Plan" default-value="pro" orientation="horizontal">
          <TRadio value="free">Gratis</TRadio>
          <TRadio value="pro">Pro</TRadio>
          <TRadio value="team">Equipo</TRadio>
        </TRadioGroup>
        <TSlider label="Volumen" :default-value="40" style="max-inline-size: 22rem" />
        <TStack gap="3" style="max-inline-size: 22rem">
          <TProgress aria-label="Subida" :value="60" />
          <TProgress aria-label="Éxito" tone="success" :value="85" />
          <TProgress aria-label="Peligro" tone="danger" size="sm" :value="95" />
        </TStack>
      </TStack>
    </section>

    <section aria-labelledby="g-nav">
      <h2 id="g-nav" class="group">Navegación y contenido</h2>
      <TStack gap="4">
        <TTabs default-value="b">
          <TTabList aria-label="Secciones">
            <TTab value="a">Cuenta</TTab>
            <TTab value="b">Facturación</TTab>
            <TTab value="c">Equipo</TTab>
          </TTabList>
          <TTabPanel value="a">Panel de la cuenta</TTabPanel>
          <TTabPanel value="b">Panel de facturación</TTabPanel>
          <TTabPanel value="c">Panel del equipo</TTabPanel>
        </TTabs>
        <TAccordion :default-value="['uno']" variant="bordered">
          <TAccordionItem value="uno">
            <TAccordionTrigger>¿Puedo cambiar el tema después?</TAccordionTrigger>
            <TAccordionContent>Sí: exporta de nuevo y sustituye el archivo.</TAccordionContent>
          </TAccordionItem>
          <TAccordionItem value="dos">
            <TAccordionTrigger>¿Funciona en modo oscuro?</TAccordionTrigger>
            <TAccordionContent>Cada tema define claro y oscuro a la vez.</TAccordionContent>
          </TAccordionItem>
        </TAccordion>
        <TPagination aria-label="Resultados" :page-count="12" :default-page="4" />
      </TStack>
    </section>

    <section aria-labelledby="g-overlay">
      <h2 id="g-overlay" class="group">Superposiciones y tarjetas</h2>
      <TStack direction="horizontal" gap="4" wrap align="center">
        <TTooltip>
          <TTooltipTrigger>Pasa el cursor</TTooltipTrigger>
          <TTooltipContent>Un consejo breve</TTooltipContent>
        </TTooltip>
        <TDialog>
          <TDialogTrigger>Abrir diálogo</TDialogTrigger>
          <TDialogContent>
            <TDialogTitle>¿Eliminar proyecto?</TDialogTitle>
            <TDialogDescription>Esta acción no se puede deshacer.</TDialogDescription>
            <TDialogClose>Cancelar</TDialogClose>
          </TDialogContent>
        </TDialog>
        <TAvatar name="Ada Lovelace" />
        <TAvatar name="Grace Hopper" shape="square" size="lg" />
      </TStack>
      <TStack direction="horizontal" gap="4" wrap style="margin-block-start: 1rem">
        <TCard variant="outlined" style="min-inline-size: 14rem">
          <template #header>Contorno</template>
          Contenido de la tarjeta.
          <template #footer>Pie</template>
        </TCard>
        <TCard variant="elevated" style="min-inline-size: 14rem">Elevada</TCard>
        <TCard variant="filled" style="min-inline-size: 14rem">Rellena</TCard>
      </TStack>
    </section>
  </TStack>
</template>
