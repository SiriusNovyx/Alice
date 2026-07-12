import yaml from "js-yaml";
import React, { useEffect, useState } from "react";
import "./Configurator.css";
import { LevelEntry, Levels } from "./Levels";
import { LogChannel, LogChannels } from "./LogChannels";

export function Configurator() {
  const [prefix, setPrefix] = useState("!");
  const [levels, setLevels] = useState<LevelEntry[]>([]);

  const [withModCommands, setWithModCommands] = useState(false);
  const [muteRoleId, setMuteRoleId] = useState("");
  const [caseChannelId, setCaseChannelId] = useState("");
  const [dmModActionReasons, setDmModActionReasons] = useState(false);

  const [withLogs, setWithLogs] = useState(false);
  const [logChannels, setLogChannels] = useState<LogChannel[]>([]);

  // AIO / community plugins
  const [withVoiceMaster, setWithVoiceMaster] = useState(false);
  const [vmHubChannelId, setVmHubChannelId] = useState("");
  const [vmCategoryId, setVmCategoryId] = useState("");

  const [withTickets, setWithTickets] = useState(false);
  const [ticketsCategoryId, setTicketsCategoryId] = useState("");
  const [ticketsLogChannelId, setTicketsLogChannelId] = useState("");
  const [ticketsSupportRoleId, setTicketsSupportRoleId] = useState("");

  const [withGiveaways, setWithGiveaways] = useState(false);
  const [withLeveling, setWithLeveling] = useState(false);

  const [withVerify, setWithVerify] = useState(false);
  const [verifyRoleId, setVerifyRoleId] = useState("");
  const [verifyChannelId, setVerifyChannelId] = useState("");

  const [withFunSocial, setWithFunSocial] = useState(false);

  const [withModmail, setWithModmail] = useState(false);
  const [modmailCategoryId, setModmailCategoryId] = useState("");
  const [modmailStaffRoleId, setModmailStaffRoleId] = useState("");

  const [withAntiNuke, setWithAntiNuke] = useState(false);
  const [antiNukeQuarantineRoleId, setAntiNukeQuarantineRoleId] = useState("");
  const [antiNukeLogChannelId, setAntiNukeLogChannelId] = useState("");

  const [withEconomy, setWithEconomy] = useState(false);
  const [withMusic, setWithMusic] = useState(false);
  const [withCollection, setWithCollection] = useState(false);
  const [withNsfw, setWithNsfw] = useState(false);

  const [withBoosterRoles, setWithBoosterRoles] = useState(false);
  const [boosterRoleId, setBoosterRoleId] = useState("");

  const [result, setResult] = useState({});
  useEffect(() => {
    const resultObj: any = {
      prefix,
      levels: levels.reduce((obj, entry) => {
        obj[entry[0]] = entry[1];
        return obj;
      }, {}),
      plugins: {
        utility: {},
      },
    };

    if (withModCommands) {
      resultObj.plugins.cases = {
        config: {
          case_log_channel: caseChannelId,
        },
      };

      resultObj.plugins.mod_actions = {};

      if (muteRoleId) {
        resultObj.plugins.mutes = {
          config: {
            mute_role: muteRoleId,
          },
        };

        if (dmModActionReasons) {
          resultObj.plugins.mutes.config.dm_on_mute = true;
        }
      }

      if (dmModActionReasons) {
        resultObj.plugins.mod_actions = {
          config: {
            dm_on_warn: true,
            dm_on_kick: true,
            dm_on_ban: true,
          },
        };
      }
    }

    if (withLogs) {
      resultObj.plugins.logs = {
        config: {
          channels: logChannels.reduce((obj, logChannel) => {
            if (logChannel.includeExclude === "include") {
              obj[logChannel.id] = {
                include: Array.from(logChannel.logTypes.values()),
              };
            } else {
              obj[logChannel.id] = {
                exclude: Array.from(logChannel.logTypes.values()),
              };
            }
            return obj;
          }, {}),
        },
      };
    }

    if (withVoiceMaster) {
      resultObj.plugins.voicemaster = {
        config: {
          enabled: true,
          hub_channel_id: vmHubChannelId || null,
          category_id: vmCategoryId || null,
          default_name: "{user}'s Channel",
          default_limit: 0,
        },
      };
    }

    if (withTickets) {
      resultObj.plugins.tickets = {
        config: {
          enabled: true,
          parent_category_id: ticketsCategoryId || null,
          log_channel_id: ticketsLogChannelId || null,
          support_role_ids: ticketsSupportRoleId ? [ticketsSupportRoleId] : [],
          categories: {
            support: {
              name: "Support",
              description: "General help",
            },
          },
        },
      };
    }

    if (withGiveaways) {
      resultObj.plugins.giveaways = {
        config: {
          enabled: true,
        },
      };
    }

    if (withLeveling) {
      resultObj.plugins.leveling = {
        config: {
          enabled: true,
          min_xp: 15,
          max_xp: 25,
          cooldown_seconds: 60,
        },
      };
    }

    if (withVerify) {
      resultObj.plugins.verify = {
        config: {
          enabled: true,
          verified_role_id: verifyRoleId || null,
          channel_id: verifyChannelId || null,
          mode: "button",
        },
      };
    }

    if (withFunSocial) {
      resultObj.plugins.fun = {
        config: {
          enabled: true,
          can_use: true,
        },
      };
      resultObj.plugins.social = {
        config: {
          enabled: true,
          can_use: true,
        },
      };
    }

    if (withModmail) {
      resultObj.plugins.modmail = {
        config: {
          enabled: true,
          category_id: modmailCategoryId || null,
          staff_role_ids: modmailStaffRoleId ? [modmailStaffRoleId] : [],
        },
      };
    }

    if (withAntiNuke) {
      resultObj.plugins.antinuke = {
        config: {
          enabled: true,
          quarantine_role_id: antiNukeQuarantineRoleId || null,
          log_channel_id: antiNukeLogChannelId || null,
        },
      };
    }

    if (withEconomy) {
      resultObj.plugins.economy = {
        config: {
          enabled: true,
          currency_name: "coins",
        },
      };
    }

    if (withMusic) {
      resultObj.plugins.music = {
        config: {
          enabled: true,
          can_use: true,
          stay_247: false,
          default_volume: 100,
        },
      };
    }

    if (withCollection) {
      resultObj.plugins.collection = {
        config: {
          enabled: true,
        },
      };
    }

    if (withNsfw) {
      resultObj.plugins.nsfw = {
        config: {
          enabled: true,
          can_use: true,
        },
      };
    }

    if (withBoosterRoles) {
      resultObj.plugins.booster_roles = {
        config: {
          enabled: true,
          booster_role_id: boosterRoleId || null,
        },
      };
    }

    setResult(resultObj);
  }, [
    prefix,
    levels,
    withModCommands,
    muteRoleId,
    caseChannelId,
    dmModActionReasons,
    withLogs,
    logChannels,
    withVoiceMaster,
    vmHubChannelId,
    vmCategoryId,
    withTickets,
    ticketsCategoryId,
    ticketsLogChannelId,
    ticketsSupportRoleId,
    withGiveaways,
    withLeveling,
    withVerify,
    verifyRoleId,
    verifyChannelId,
    withFunSocial,
    withModmail,
    modmailCategoryId,
    modmailStaffRoleId,
    withAntiNuke,
    antiNukeQuarantineRoleId,
    antiNukeLogChannelId,
    withEconomy,
    withMusic,
    withCollection,
    withNsfw,
    withBoosterRoles,
    boosterRoleId,
  ]);

  const [formattedResult, setFormattedResult] = useState("");
  useEffect(() => {
    let _formattedResult = yaml.dump(result);

    // Add line break before each unquoted top-level or second-level property
    _formattedResult = _formattedResult.replace(/^ {0,2}[a-z_]+:/gm, "\n$&").trim();

    // Add additional line break at the end
    _formattedResult += "\n";

    // Explain "exclude: []"
    _formattedResult = _formattedResult.replace(/exclude: \[]/, "$& # Exclude nothing = include everything");

    setFormattedResult(_formattedResult);
  }, [result]);

  const resultRows = formattedResult.split("\n").length || 1;

  const [copied, setCopied] = useState(false);
  function copyResultText(textarea: HTMLTextAreaElement) {
    textarea.select();
    document.execCommand("copy");
    setCopied(true);
  }

  const [copyResetTimeout, setCopyResetTimeout] = useState<number | null>(null);
  useEffect(() => {
    if (!copied) {
      return;
    }

    if (copyResetTimeout != null) {
      window.clearTimeout(copyResetTimeout);
    }

    const timeout = window.setTimeout(() => setCopied(false), 3000);
    setCopyResetTimeout(timeout);
  }, [copied]);

  return (
    <div className="Configurator">
      {/* Options */}
      <div className="options">
        <h2>Prefix</h2>
        <div className="control">
          <label>
            Bot prefix
            <br />
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </label>
        </div>

        <h2>Levels</h2>
        <div className="control">
          <Levels levels={levels} setLevels={setLevels} />
        </div>

        <h2>Mod commands</h2>
        <div className="control">
          <label>
            <input type="checkbox" checked={withModCommands} onChange={(e) => setWithModCommands(e.target.checked)} />
            Start with a basic mod command setup
          </label>

          {withModCommands && (
            <div>
              <label>
                Mute role ID
                <br />
                <input value={muteRoleId} onChange={(e) => setMuteRoleId(e.target.value)} />
              </label>

              <label>
                Case channel ID
                <br />
                <input value={caseChannelId} onChange={(e) => setCaseChannelId(e.target.value)} />
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={dmModActionReasons}
                  onChange={(e) => setDmModActionReasons(e.target.checked)}
                />
                DM reason with mod actions
              </label>
            </div>
          )}
        </div>

        <h2>Logs</h2>
        <div className="control">
          <label>
            <input type="checkbox" checked={withLogs} onChange={(e) => setWithLogs(e.target.checked)} />
            Start with a basic logging setup
          </label>

          {withLogs && <LogChannels logChannels={logChannels} setLogChannels={setLogChannels} />}
        </div>

        <h2>AIO / Community</h2>
        <div className="control">
          <label>
            <input
              type="checkbox"
              checked={withVoiceMaster}
              onChange={(e) => setWithVoiceMaster(e.target.checked)}
            />
            VoiceMaster (temp voice channels)
          </label>
          {withVoiceMaster && (
            <div>
              <label>
                Hub voice channel ID
                <br />
                <input value={vmHubChannelId} onChange={(e) => setVmHubChannelId(e.target.value)} />
              </label>
              <label>
                Temp category ID (optional)
                <br />
                <input value={vmCategoryId} onChange={(e) => setVmCategoryId(e.target.value)} />
              </label>
            </div>
          )}

          <label>
            <input type="checkbox" checked={withTickets} onChange={(e) => setWithTickets(e.target.checked)} />
            Tickets
          </label>
          {withTickets && (
            <div>
              <label>
                Ticket parent category ID
                <br />
                <input value={ticketsCategoryId} onChange={(e) => setTicketsCategoryId(e.target.value)} />
              </label>
              <label>
                Support role ID (optional)
                <br />
                <input value={ticketsSupportRoleId} onChange={(e) => setTicketsSupportRoleId(e.target.value)} />
              </label>
              <label>
                Log channel ID (optional)
                <br />
                <input value={ticketsLogChannelId} onChange={(e) => setTicketsLogChannelId(e.target.value)} />
              </label>
            </div>
          )}

          <label>
            <input type="checkbox" checked={withGiveaways} onChange={(e) => setWithGiveaways(e.target.checked)} />
            Giveaways
          </label>

          <label>
            <input type="checkbox" checked={withLeveling} onChange={(e) => setWithLeveling(e.target.checked)} />
            Leveling (XP)
          </label>

          <label>
            <input type="checkbox" checked={withVerify} onChange={(e) => setWithVerify(e.target.checked)} />
            Verify (button gate)
          </label>
          {withVerify && (
            <div>
              <label>
                Verified role ID
                <br />
                <input value={verifyRoleId} onChange={(e) => setVerifyRoleId(e.target.value)} />
              </label>
              <label>
                Verify channel ID
                <br />
                <input value={verifyChannelId} onChange={(e) => setVerifyChannelId(e.target.value)} />
              </label>
            </div>
          )}

          <label>
            <input type="checkbox" checked={withFunSocial} onChange={(e) => setWithFunSocial(e.target.checked)} />
            Fun + Social
          </label>

          <label>
            <input type="checkbox" checked={withModmail} onChange={(e) => setWithModmail(e.target.checked)} />
            Modmail
          </label>
          {withModmail && (
            <div>
              <label>
                Modmail category ID
                <br />
                <input value={modmailCategoryId} onChange={(e) => setModmailCategoryId(e.target.value)} />
              </label>
              <label>
                Staff role ID
                <br />
                <input value={modmailStaffRoleId} onChange={(e) => setModmailStaffRoleId(e.target.value)} />
              </label>
            </div>
          )}

          <label>
            <input type="checkbox" checked={withAntiNuke} onChange={(e) => setWithAntiNuke(e.target.checked)} />
            AntiNuke
          </label>
          {withAntiNuke && (
            <div>
              <label>
                Quarantine role ID
                <br />
                <input
                  value={antiNukeQuarantineRoleId}
                  onChange={(e) => setAntiNukeQuarantineRoleId(e.target.value)}
                />
              </label>
              <label>
                Log channel ID
                <br />
                <input value={antiNukeLogChannelId} onChange={(e) => setAntiNukeLogChannelId(e.target.value)} />
              </label>
            </div>
          )}

          <label>
            <input type="checkbox" checked={withEconomy} onChange={(e) => setWithEconomy(e.target.checked)} />
            Economy
          </label>

          <label>
            <input type="checkbox" checked={withMusic} onChange={(e) => setWithMusic(e.target.checked)} />
            Music (requires Lavalink)
          </label>

          <label>
            <input type="checkbox" checked={withCollection} onChange={(e) => setWithCollection(e.target.checked)} />
            Collection (gacha)
          </label>

          <label>
            <input type="checkbox" checked={withNsfw} onChange={(e) => setWithNsfw(e.target.checked)} />
            NSFW (NSFW channels only)
          </label>

          <label>
            <input
              type="checkbox"
              checked={withBoosterRoles}
              onChange={(e) => setWithBoosterRoles(e.target.checked)}
            />
            Booster roles
          </label>
          {withBoosterRoles && (
            <div>
              <label>
                Discord booster role ID
                <br />
                <input value={boosterRoleId} onChange={(e) => setBoosterRoleId(e.target.value)} />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      <textarea
        className="result"
        rows={resultRows}
        readOnly={true}
        value={formattedResult}
        onClick={(e) => copyResultText(e.target as HTMLTextAreaElement)}
      />
      {copied ? <em>Copied!</em> : <em>Click textarea to copy</em>}
    </div>
  );
}
