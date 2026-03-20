---
name: pwa-plantao
description: Regras e padrões PWA específicos do app Plantão. Ativar ao mexer em vite.config.js, manifest, service worker, push notifications, cache, ou comportamento offline.
---

# PWA — Plantão

## Configuração atual (não alterar sem motivo)

```js
registerType: 'autoUpdate'   // atualiza automaticamente
skipWaiting: true            // novo SW assume controle imediato
clientsClaim: true           // controla todas as abas abertas
cleanupOutdatedCaches: true  // remove caches antigos
```

## Service Worker

- Arquivo de push: `/public/push-handlers.js` — importado via `importScripts`
- Nunca remover `importScripts` do workbox config
- Cache de fontes Google: strategy `CacheFirst`, nome `google-fonts-cache`
- Arquivos cacheados: `**/*.{js,css,html,ico,png,svg,woff2}`

## Manifest

- `theme_color` e `background_color`: sempre `#0A1628`
- `display: standalone` — comportamento de app nativo
- `orientation: portrait` — app é mobile, não girar
- Ícones obrigatórios: `icon-192.png` e `icon-512.png` em `public/icons/`

## Regras ao modificar

- Ao adicionar rota de runtime cache: sempre definir `cacheName` único
- Estratégias aceitas: `CacheFirst` (assets estáticos), `NetworkFirst` (API/Firebase)
- Firebase Realtime DB não deve ser cacheado — é tempo real
- Nunca cachear rotas de autenticação

## Testar depois de mudanças

1. `npm run build` — verificar se SW gerado inclui os arquivos certos
2. Abrir DevTools → Application → Service Workers — confirmar ativação
3. Testar offline: desligar rede e navegar no app
4. Verificar se `push-handlers.js` está sendo importado no SW gerado

## Erros comuns

- SW não atualizando: verificar `skipWaiting: true` e `clientsClaim: true`
- Push não funcionando: verificar se `importScripts` ainda está no workbox config
- Cache desatualizado: `cleanupOutdatedCaches: true` deve estar presente
