export const CAMPOS = [
  { key: 'posicaoCama',  label: 'Posição da cama e decúbito', defaultOn: true },
  { key: 'estadoMental', label: 'Estado mental',              defaultOn: true },
  { key: 'respiracao',   label: 'Respiração',                 defaultOn: true },
  { key: 'acompanhante', label: 'Acompanhante',               defaultOn: true },
  { key: 'dispositivos', label: 'Dispositivos',               defaultOn: true },
  { key: 'obsApresenta', label: 'Observações (Apresenta...)', defaultOn: true },
  { key: 'evacuacao',    label: 'Evacuação',                  defaultOn: true },
  { key: 'diurese',      label: 'Diurese',                    defaultOn: true },
  { key: 'queixas',      label: 'Queixas',                    defaultOn: true },
]

export function defaultCamposAtivos() {
  const obj = {}
  CAMPOS.forEach(c => { obj[c.key] = c.defaultOn })
  return obj
}
