// Portada: un panel de trabajo montado solo con componentes de @tessen-ui/react.
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Progress,
  Slider,
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
} from '@tessen-ui/react';

const stats = [
  { label: 'Despliegues', value: '48', note: '+6 esta semana', tone: 'success' as const },
  { label: 'Pruebas en verde', value: '1 204', note: 'de 1 204', tone: 'brand' as const },
  { label: 'Incidencias', value: '3', note: '1 urgente', tone: 'warning' as const },
];

const weeks = [38, 52, 44, 67, 58, 74, 61, 83, 70, 92, 78, 96];

const rows = [
  { who: 'Ada Lovelace', what: 'Select con búsqueda', state: 'Publicado', tone: 'success' as const },
  { who: 'Grace Hopper', what: 'Foco en Dialog', state: 'En revisión', tone: 'warning' as const },
  { who: 'Alan Turing', what: 'Tema Medianoche', state: 'Borrador', tone: 'neutral' as const },
];

export default function HeroShowcase() {
  return (
    <div className="dash">
      <div className="dash-bar">
        <div>
          <strong>Entregas de diseño</strong>
          <span>Datos de ejemplo</span>
        </div>
        <Tabs defaultValue="m" variant="segmented">
          <TabList aria-label="Periodo">
            <Tab value="s">Semana</Tab>
            <Tab value="m">Mes</Tab>
            <Tab value="y">Año</Tab>
          </TabList>
        </Tabs>
        <Input aria-label="Buscar entrega" placeholder="Buscar entrega" size="sm" />
        <Button size="sm">Nueva entrega</Button>
      </div>

      <div className="dash-stats">
        {stats.map((s) => (
          <Card key={s.label} variant="outlined" padding="none">
            <div className="stat">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
              <Badge tone={s.tone} size="sm">
                {s.note}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="dash-grid">
        <Card variant="outlined" padding="none">
          <div className="panel">
            <h3>Actividad</h3>
            <div className="bars" role="img" aria-label="Actividad creciente en doce semanas">
              {weeks.map((h, i) => (
                <i key={i} style={{ blockSize: `${h}%` }} />
              ))}
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="none">
          <div className="panel">
            <h3>Ajustes</h3>
            <Switch defaultChecked>Avisar al publicar</Switch>
            <Switch>Exigir revisión doble</Switch>
            <Slider label="Cobertura mínima" defaultValue={80} />
            <div className="people">
              <Avatar name="Ada Lovelace" size="sm" />
              <Avatar name="Grace Hopper" size="sm" />
              <Avatar name="Alan Turing" size="sm" />
              <span>3 personas revisan</span>
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="none">
          <div className="panel">
            <h3>Cambios recientes</h3>
            <Table density="compact">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Autoría</TableHeaderCell>
                  <TableHeaderCell>Cambio</TableHeaderCell>
                  <TableHeaderCell>Estado</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.what}>
                    <TableCell>{r.who}</TableCell>
                    <TableCell>{r.what}</TableCell>
                    <TableCell>
                      <Badge tone={r.tone} size="sm">
                        {r.state}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        <Card variant="outlined" padding="none">
          <div className="panel">
            <h3>Versión 0.1</h3>
            <Progress aria-label="Avance de la versión" value={72} />
            <Alert tone="info" title="Falta la revisión">
              Quedan dos componentes por aprobar.
            </Alert>
            <Button variant="secondary" size="sm">
              Ver pendientes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
