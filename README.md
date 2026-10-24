# Tvijo frontend

Versioned frontend source for [tvijo.com](https://tvijo.com). This snapshot preserves the deployed frontend and the connected knowledge changes. Backend credentials, account data and private deployment configuration are not included.

The connected knowledge renderer and article catalog are shared with [Tvijo DSHREM](https://github.com/nikbibamon/dshrempub). Runtime verification and current extension releases are served by [dsh.tvijo.com](https://dsh.tvijo.com/knowledge). Article links connect the main site, DSH and Platform; private workspace data does not enter the public graph.

From `frontend/`, use `npm ci` and `npm run build`. Build on a volume with sufficient resources, then run `npm start` in the prepared deployment environment. Site activation requires checking the candidate before switching traffic. Set the existing documented API URL configuration for your environment; keep credentials out of source control.
