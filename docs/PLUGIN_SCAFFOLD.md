# Guild plugin scaffold checklist

Use this when adding a new Alice/Zeppelin guild plugin. Follow existing plugins such as `Reminders` and `Starboard`.

## Steps

1. **Config + types** — `backend/src/plugins/<Name>/types.ts`
   - Zod `z.strictObject` config schema
   - `BasePluginType` interface with `configSchema` and `state`
   - Export command/event helpers (`guildPluginMessageCommand`, slash group/cmd, event listener)

2. **Docs** — `backend/src/plugins/<Name>/docs.ts`
   - `ZeppelinPluginDocs` with `prettyName`, `description`, `configSchema`, `type` (`stable` / `legacy` / etc.)

3. **Plugin entry** — `backend/src/plugins/<Name>/<Name>Plugin.ts`
   - `guildPlugin()({ name, configSchema, defaultOverrides, messageCommands, slashCommands, events, lifecycle hooks })`
   - Wire repositories in `beforeLoad`; CommonPlugin in `beforeStart`

4. **Commands / events** — `commands/`, `events/`, optional `functions/` or `util/`
   - Prefer shared `actual*Cmd` helpers when both prefix and slash exist

5. **Persistence (if needed)**
   - Entity: `backend/src/data/entities/<Entity>.ts` (`@Entity` + columns)
   - Repo: `backend/src/data/Guild<Name>.ts` extending `BaseGuildRepository`
   - Migration: `backend/src/migrations/<timestamp>-Create<Table>.ts`
   - Entities are auto-loaded from `dist/data/entities/*.js` (no manual registry)

6. **Register** — import plugin + docs in `backend/src/plugins/availablePlugins.ts` and append to `availableGuildPlugins`

7. **Env** — add keys in `backend/src/env.ts` only when the plugin needs them

8. **Dashboard** — YAML config remains source of truth via the guild config editor; add Vue guide/docs pages when the plugin is stable

## Do not

- Reimplement ModActions / Automod / Cases / Mutes / Logs / Reminders / WelcomeMessage
- Add Mongo/Mongoose or dual-write
- Port Vermeil TLS disable or multi-cluster DB patterns
