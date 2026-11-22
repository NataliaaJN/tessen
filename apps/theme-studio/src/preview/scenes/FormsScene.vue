<script setup lang="ts">
import {
  TButton,
  TCard,
  TCheckbox,
  TField,
  TFieldDescription,
  TFieldError,
  TFieldLabel,
  TInput,
  TNativeSelect,
  TRadio,
  TRadioGroup,
  TStack,
  TSwitch,
  TTextarea,
} from '@tessen-ui/vue';
</script>

<template>
  <TCard variant="outlined" padding="lg" style="max-inline-size: 38rem; margin-inline: auto">
    <template #header>Crea tu cuenta</template>
    <form @submit.prevent>
      <TStack gap="5">
        <TField required>
          <TFieldLabel>Nombre completo</TFieldLabel>
          <TInput default-value="Ada Lovelace" />
        </TField>
        <TField required>
          <TFieldLabel>Correo electrónico</TFieldLabel>
          <TInput type="email" placeholder="tu@correo.com" />
          <TFieldDescription>No lo compartimos con nadie.</TFieldDescription>
        </TField>
        <TField invalid required>
          <TFieldLabel>Contraseña</TFieldLabel>
          <TInput type="password" default-value="123" />
          <TFieldError>Usa al menos 8 caracteres.</TFieldError>
        </TField>
        <TField>
          <TFieldLabel>País</TFieldLabel>
          <TNativeSelect default-value="es">
            <option value="es">España</option>
            <option value="mx">México</option>
            <option value="ar">Argentina</option>
            <option value="co">Colombia</option>
          </TNativeSelect>
        </TField>
        <TField>
          <TFieldLabel>Cuéntanos sobre ti</TFieldLabel>
          <TTextarea placeholder="Escribe aquí…" />
        </TField>
        <TRadioGroup aria-label="Tipo de cuenta" default-value="personal">
          <TRadio value="personal">Personal</TRadio>
          <TRadio value="empresa">Empresa</TRadio>
        </TRadioGroup>
        <TSwitch default-checked>Recibir novedades por correo</TSwitch>
        <TCheckbox>Acepto los términos y condiciones</TCheckbox>
        <TStack direction="horizontal" gap="3" justify="end">
          <TButton variant="ghost">Cancelar</TButton>
          <TButton type="submit">Crear cuenta</TButton>
        </TStack>
      </TStack>
    </form>
  </TCard>
</template>
