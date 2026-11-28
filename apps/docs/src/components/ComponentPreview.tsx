// Catálogo: una muestra viva y compacta de cada componente, hecha con @tessen-ui/react.
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  AspectRatio,
  Avatar,
  Badge,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Combobox,
  Container,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Divider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  Field,
  FieldDescription,
  FieldLabel,
  Grid,
  IconButton,
  Input,
  Link,
  List,
  ListItem,
  NativeSelect,
  Pagination,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TabList,
  Tabs,
  Textarea,
  Toaster,
  ToggleButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  VisuallyHidden,
  createToaster,
} from '@tessen-ui/react';
import type { ReactNode } from 'react';

const fruit = [
  { value: 'cereza', label: 'Cereza' },
  { value: 'mango', label: 'Mango' },
  { value: 'pera', label: 'Pera' },
];

const toaster = createToaster();

const block = (label: string) => <div className="pv-block">{label}</div>;

const previews: Record<string, () => ReactNode> = {
  accordion: () => (
    <Accordion defaultValue={['a']} variant="bordered">
      <AccordionItem value="a">
        <AccordionTrigger>Envíos</AccordionTrigger>
        <AccordionContent>Salen en 24 horas.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Devoluciones</AccordionTrigger>
        <AccordionContent>Tienes 30 días.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  alert: () => (
    <Alert tone="success" title="Guardado">
      Los cambios están publicados.
    </Alert>
  ),
  'alert-dialog': () => (
    <AlertDialog>
      <AlertDialogTrigger>Eliminar proyecto</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>¿Eliminar el proyecto?</AlertDialogTitle>
        <AlertDialogDescription>No se puede deshacer.</AlertDialogDescription>
        <AlertDialogCancel>Conservar</AlertDialogCancel>
        <AlertDialogAction tone="danger">Eliminar</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  ),
  'aspect-ratio': () => (
    <div style={{ inlineSize: 190 }}>
      <AspectRatio ratio="16/9">{block('16:9')}</AspectRatio>
    </div>
  ),
  avatar: () => (
    <Stack direction="horizontal" gap="3" align="center">
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Grace Hopper" size="lg" />
      <Avatar name="Alan Turing" shape="square" size="xl" />
    </Stack>
  ),
  badge: () => (
    <Stack direction="horizontal" gap="2" wrap>
      <Badge tone="brand" variant="solid">
        Nuevo
      </Badge>
      <Badge tone="success">Activo</Badge>
      <Badge tone="warning">En revisión</Badge>
      <Badge tone="danger" variant="outline">
        Error
      </Badge>
    </Stack>
  ),
  breadcrumbs: () => (
    <Breadcrumbs>
      <BreadcrumbItem href="/">Inicio</BreadcrumbItem>
      <BreadcrumbItem href="/components/">Equipo</BreadcrumbItem>
      <BreadcrumbItem current>Ajustes</BreadcrumbItem>
    </Breadcrumbs>
  ),
  button: () => (
    <Stack direction="horizontal" gap="2">
      <Button>Crear algo</Button>
      <Button variant="secondary">Explorar</Button>
    </Stack>
  ),
  'button-group': () => (
    <ButtonGroup aria-label="Periodo" attached>
      <ToggleButton>Día</ToggleButton>
      <ToggleButton defaultPressed>Semana</ToggleButton>
      <ToggleButton>Mes</ToggleButton>
    </ButtonGroup>
  ),
  card: () => (
    <Card variant="elevated" padding="sm" header="Estudio" footer="Hace 2 min">
      Tres piezas nuevas.
    </Card>
  ),
  checkbox: () => (
    <Stack gap="3">
      <Checkbox defaultChecked>Enviar resumen</Checkbox>
      <Checkbox>Avisar al equipo</Checkbox>
    </Stack>
  ),
  combobox: () => <Combobox label="Fruta" items={fruit} placeholder="Escribe para filtrar" />,
  container: () => (
    <Container size="sm" gutters>
      {block('Ancho de lectura')}
    </Container>
  ),
  dialog: () => (
    <Dialog>
      <DialogTrigger>Abrir ventana</DialogTrigger>
      <DialogContent>
        <DialogTitle>Invitar al equipo</DialogTitle>
        <DialogDescription>Comparte el enlace con quien quieras.</DialogDescription>
        <DialogClose>Cerrar</DialogClose>
      </DialogContent>
    </Dialog>
  ),
  divider: () => (
    <Stack direction="horizontal" gap="4" align="center">
      <span>Vue</span>
      <Divider orientation="vertical" style={{ blockSize: 32 }} />
      <span>React</span>
    </Stack>
  ),
  'dropdown-menu': () => (
    <DropdownMenu>
      <DropdownMenuTrigger>Acciones</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem value="edit">Editar</DropdownMenuItem>
        <DropdownMenuItem value="copy">Duplicar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  'empty-state': () => (
    <EmptyState title="Sin proyectos" description="Crea el primero.">
      <Button size="sm">Crear proyecto</Button>
    </EmptyState>
  ),
  field: () => (
    <Field>
      <FieldLabel>Correo</FieldLabel>
      <Input type="email" placeholder="tu@equipo.example" />
      <FieldDescription>Solo para avisos.</FieldDescription>
    </Field>
  ),
  grid: () => (
    <Grid columns="3" gap="2">
      {block('1')}
      {block('2')}
      {block('3')}
    </Grid>
  ),
  'icon-button': () => (
    <Stack direction="horizontal" gap="3">
      <IconButton label="Añadir">＋</IconButton>
      <IconButton label="Marcar" variant="outline">
        ☆
      </IconButton>
      <IconButton label="Cerrar" variant="ghost">
        ✕
      </IconButton>
    </Stack>
  ),
  input: () => <Input aria-label="Proyecto" placeholder="Tu próximo proyecto" />,
  link: () => <Link href="/get-started/">Leer la guía de inicio</Link>,
  list: () => (
    <List variant="divided" style={{ inlineSize: 200 }}>
      <ListItem>Tokens</ListItem>
      <ListItem>Componentes</ListItem>
      <ListItem>Temas</ListItem>
    </List>
  ),
  'native-select': () => (
    <NativeSelect aria-label="País" defaultValue="es">
      <option value="es">España</option>
      <option value="fr">Francia</option>
    </NativeSelect>
  ),
  pagination: () => (
    <Pagination aria-label="Resultados" pageCount={9} defaultPage={4} siblings={0} />
  ),
  popover: () => (
    <Popover>
      <PopoverTrigger>Ver detalles</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Entrega</PopoverTitle>
        <PopoverDescription>Llega en dos días.</PopoverDescription>
      </PopoverContent>
    </Popover>
  ),
  progress: () => (
    <Stack gap="4">
      <Progress aria-label="Subida" value={68} />
      <Progress aria-label="Copia" tone="success" value={35} />
    </Stack>
  ),
  'radio-group': () => (
    <RadioGroup aria-label="Plan" defaultValue="pro" orientation="horizontal">
      <Radio value="free">Libre</Radio>
      <Radio value="pro">Pro</Radio>
    </RadioGroup>
  ),
  select: () => <Select label="Fruta" items={fruit} defaultValue="mango" />,
  skeleton: () => (
    <Stack direction="horizontal" gap="3" align="center">
      <Skeleton shape="circle" style={{ inlineSize: 44, blockSize: 44 }} />
      <Stack gap="2">
        <Skeleton style={{ inlineSize: 150, blockSize: 12 }} />
        <Skeleton style={{ inlineSize: 100, blockSize: 12 }} />
      </Stack>
    </Stack>
  ),
  slider: () => <Slider label="Volumen" defaultValue={62} />,
  spinner: () => (
    <Stack direction="horizontal" gap="4" align="center">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </Stack>
  ),
  stack: () => (
    <Stack gap="2">
      {block('Uno')}
      {block('Dos')}
    </Stack>
  ),
  switch: () => (
    <Stack gap="3">
      <Switch defaultChecked>Sincronizar</Switch>
      <Switch>Modo foco</Switch>
    </Stack>
  ),
  table: () => (
    <Table density="compact">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Equipo</TableHeaderCell>
          <TableHeaderCell numeric>Plazas</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Diseño</TableCell>
          <TableCell numeric>6</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Web</TableCell>
          <TableCell numeric>9</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
  tabs: () => (
    <Tabs defaultValue="a" variant="segmented">
      <TabList aria-label="Vista">
        <Tab value="a">Lista</Tab>
        <Tab value="b">Tablero</Tab>
      </TabList>
    </Tabs>
  ),
  textarea: () => (
    <Textarea aria-label="Notas" defaultValue="Las buenas interfaces te dejan pensar." />
  ),
  toast: () => (
    <>
      <Button
        variant="secondary"
        onClick={() => toaster.create({ title: 'Guardado', description: 'Todo al día.' })}
      >
        Mostrar aviso
      </Button>
      <Toaster toaster={toaster} />
    </>
  ),
  'toggle-button': () => <ToggleButton defaultPressed>Fijar elemento</ToggleButton>,
  tooltip: () => (
    <Tooltip>
      <TooltipTrigger>Pasa por encima</TooltipTrigger>
      <TooltipContent>Guarda el archivo</TooltipContent>
    </Tooltip>
  ),
  'visually-hidden': () => (
    <IconButton label="Buscar">
      ⌕<VisuallyHidden>Buscar</VisuallyHidden>
    </IconButton>
  ),
};

export default function ComponentPreview({ slug }: { slug: string }) {
  return <>{previews[slug]?.() ?? null}</>;
}
