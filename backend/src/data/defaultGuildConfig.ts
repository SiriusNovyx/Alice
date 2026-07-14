/**
 * Starter guild YAML applied when a server is first allowlisted.
 * Valid as-is (bot will load), but staff must fill role/channel IDs in the dashboard.
 */
export const DEFAULT_GUILD_CONFIG = `# ============================================================
#  Alice starter config — FILL IN IDS FOR THIS SERVER
# ------------------------------------------------------------
#  Required before logging / mutes / welcome work properly:
#    1. levels — Owner / Admin / Mod role IDs
#    2. mutes.mute_role — Mute role ID
#    3. cases.case_log_channel — optional case log channel
#    4. mod_actions.alert_channel — optional rejoin alert channel
#    5. logs.channels — create 4 log channels and paste their IDs
#    6. welcome_message.send_to_channel — welcome channel (or null)
#    7. automod new_account_join alert channel (uncomment that rule)
#    8. AIO plugins — set enabled: true + IDs (see Dashboard → AIO)
# ============================================================

prefix: "!"

# Role IDs → permission levels (right-click role → Copy ID)
# levels:
#   "OWNER_ROLE_ID": 9999
#   "ADMIN_ROLE_ID": 100
#   "MOD_ROLE_ID": 50
levels: {}

plugins:

  common:
    config:
      success_emoji: "✅"
      error_emoji: "❌"

  time_and_date:
    config:
      timezone: Asia/Bangkok
      can_set_timezone: false

  message_saver:
    config:
      can_manage: false
    overrides:
      - level: ">=100"
        config:
          can_manage: true

  name_history: {}

  mod_actions:
    config:
      dm_on_warn: true
      dm_on_kick: true
      dm_on_ban: true
      message_on_warn: false
      message_on_kick: false
      message_on_ban: false
      warn_message: "You have received a warning on **{guildName}**: {reason}"
      kick_message: "You have been kicked from **{guildName}**. Reason: {reason}"
      ban_message: "You have been banned from **{guildName}**. Reason: {reason}"
      tempban_message: "You have been banned from **{guildName}** for {banTime}. Reason: {reason}"
      alert_on_rejoin: true
      alert_channel: null   # SET: channel ID for prior-ban rejoin alerts
      warn_notify_enabled: true
      warn_notify_threshold: 3
      warn_notify_message: |-
        ⚠️ This user already has **{priorWarnings}** warnings!
        Please review their cases before proceeding.
        Continue with the warning?
      ban_delete_message_days: 0
      can_note: false
      can_warn: false
      can_mute: false
      can_kick: false
      can_ban: false
      can_unban: false
      can_view: false
      can_addcase: false
      can_massban: false
      can_massunban: false
      can_massmute: false
      can_hidecase: false
      can_deletecase: false
      create_cases_for_manual_actions: true
    overrides:
      - level: ">=50"
        config:
          can_note: true
          can_warn: true
          can_mute: true
          can_kick: true
          can_view: true
          can_addcase: true
      - level: ">=100"
        config:
          can_ban: true
          can_unban: true
          can_massban: true
          can_massunban: true
          can_massmute: true
          can_hidecase: true
          can_deletecase: true

  mutes:
    config:
      mute_role: null   # SET: Mute role ID (create the role first)
      dm_on_mute: true
      dm_on_update: true
      mute_message: "You have been muted on **{guildName}**. Reason: {reason}"
      timed_mute_message: "You have been muted on **{guildName}** for {time}. Reason: {reason}"
      remove_roles_on_mute: false
      restore_roles_on_mute: false
      can_view_list: false
      can_cleanup: false
    overrides:
      - level: ">=50"
        config:
          can_view_list: true
      - level: ">=100"
        config:
          can_cleanup: true

  cases:
    config:
      log_automatic_actions: true
      case_log_channel: null   # SET: optional dedicated case log channel
      show_relative_times: true
      relative_time_cutoff: 1w

  # Logging — replace channels: {} with real channel IDs, e.g.:
  # channels:
  #   "MOD_LOG_CHANNEL_ID":
  #     include: [MEMBER_WARN, MEMBER_MUTE, MEMBER_BAN, ...]
  logs:
    config:
      channels: {}
      # Recommended includes once you add channel IDs:
      # MOD LOG: MEMBER_WARN, MEMBER_MUTE, MEMBER_UNMUTE, MEMBER_MUTE_EXPIRED,
      #   MEMBER_KICK, MEMBER_BAN, MEMBER_UNBAN, MEMBER_FORCEBAN, MEMBER_SOFTBAN,
      #   MEMBER_TIMED_BAN, MEMBER_TIMED_UNBAN, MEMBER_TIMED_MUTE, MEMBER_TIMED_UNMUTE,
      #   MEMBER_NOTE, MEMBER_TIMEOUT, MEMBER_TIMEOUT_REMOVED, MASSBAN, MASSUNBAN,
      #   MASSMUTE, CASE_CREATE, CASE_UPDATE, CASE_DELETE, AUTOMOD_ACTION,
      #   SET_ANTIRAID_USER, SET_ANTIRAID_AUTO, DM_FAILED
      # MESSAGE LOG: MESSAGE_DELETE, MESSAGE_DELETE_BULK, MESSAGE_DELETE_BARE,
      #   MESSAGE_DELETE_AUTO, MESSAGE_EDIT, CENSOR, CLEAN
      # MEMBER LOG: MEMBER_JOIN, MEMBER_LEAVE, MEMBER_JOIN_WITH_PRIOR_RECORDS,
      #   MEMBER_ROLE_ADD, MEMBER_ROLE_REMOVE, MEMBER_ROLE_CHANGES,
      #   MEMBER_TIMED_ROLE_ADD, MEMBER_TIMED_ROLE_REMOVE, MEMBER_NICK_CHANGE,
      #   MEMBER_USERNAME_CHANGE, MEMBER_RESTORE, MEMBER_MUTE_REJOIN
      # SERVER LOG: CHANNEL_CREATE, CHANNEL_DELETE, CHANNEL_UPDATE,
      #   THREAD_CREATE, THREAD_DELETE, THREAD_UPDATE, ROLE_CREATE, ROLE_DELETE,
      #   ROLE_UPDATE, VOICE_CHANNEL_JOIN, VOICE_CHANNEL_LEAVE, VOICE_CHANNEL_MOVE,
      #   VOICE_CHANNEL_FORCE_MOVE, VOICE_CHANNEL_FORCE_DISCONNECT, EMOJI_CREATE,
      #   EMOJI_DELETE, EMOJI_UPDATE, STICKER_CREATE, STICKER_DELETE, STICKER_UPDATE,
      #   STAGE_INSTANCE_CREATE, STAGE_INSTANCE_DELETE, STAGE_INSTANCE_UPDATE, BOT_ALERT

  automod:
    config:
      rules:
        no_invites:
          triggers:
            - match_invites:
                allow_group_dm_invites: false
                match_messages: true
                match_embeds: true
          actions:
            clean: true
            warn:
              reason: "No Discord invite links allowed"

        spam_messages:
          triggers:
            - message_spam:
                amount: 5
                within: 10s
          actions:
            clean: true
            mute:
              duration: 10m
              reason: "Automated mute: message spam"

        spam_mentions:
          triggers:
            - mention_spam:
                amount: 5
                within: 10s
          actions:
            clean: true
            mute:
              duration: 30m
              reason: "Automated mute: mention spam"

        spam_attachments:
          triggers:
            - attachment_spam:
                amount: 3
                within: 15s
          actions:
            clean: true
            mute:
              duration: 5m
              reason: "Automated mute: attachment spam"

        # Uncomment and set ALERT_CHANNEL_ID after creating the channel:
        # new_account_join:
        #   triggers:
        #     - member_join:
        #         only_new: true
        #         new_threshold: 24h
        #   actions:
        #     alert:
        #       channel: "ALERT_CHANNEL_ID"
        #       text: "⚠️ New account joined: <@!{user.id}> (Account age: {age})"

      antiraid_levels:
        - low
        - medium
        - high
      can_set_antiraid: false
      can_view_antiraid: false
    overrides:
      - level: ">=50"
        config:
          can_view_antiraid: true
          rules:
            no_invites:
              enabled: false
            spam_messages:
              enabled: false
            spam_mentions:
              enabled: false
            spam_attachments:
              enabled: false
      - level: ">=100"
        config:
          can_view_antiraid: true
          can_set_antiraid: true

  slowmode:
    config:
      use_native_slowmode: true
      can_manage: false
      is_affected: true
    overrides:
      - level: ">=50"
        config:
          can_manage: true
          is_affected: false

  utility:
    config:
      can_roles: false
      can_level: false
      can_search: false
      can_clean: false
      can_info: false
      can_server: false
      can_userinfo: false
      can_roleinfo: false
      can_channelinfo: false
      can_messageinfo: false
      can_ping: false
      can_nickname: false
      can_vcmove: false
      can_vckick: false
      can_help: false
      can_about: false
      can_avatar: false
      autojoin_threads: true
    overrides:
      - level: ">=50"
        config:
          can_roles: true
          can_level: true
          can_search: true
          can_clean: true
          can_info: true
          can_server: true
          can_userinfo: true
          can_roleinfo: true
          can_channelinfo: true
          can_messageinfo: true
          can_ping: true
          can_nickname: true
          can_vcmove: true
          can_vckick: true
          can_help: true
          can_about: true
          can_avatar: true

  roles:
    config:
      can_assign: false
      can_assign_temp: false
      can_mass_assign: false
      assignable_roles: []   # SET: role IDs mods may assign
    overrides:
      - level: ">=50"
        config:
          can_assign: true
          can_assign_temp: true
      - level: ">=100"
        config:
          can_mass_assign: true

  context_menu:
    config:
      can_use: false
      can_open_mod_menu: false
    overrides:
      - level: ">=50"
        config:
          can_use: true
          can_open_mod_menu: true

  locate_user:
    config:
      can_where: false
      can_alert: false
    overrides:
      - level: ">=50"
        config:
          can_where: true
          can_alert: true

  tags:
    config:
      prefix: "!!"
      delete_with_command: true
      can_create: false
      can_use: false
      can_list: false
      categories: {}
    overrides:
      - level: ">=0"
        config:
          can_use: true
          can_list: true
      - level: ">=50"
        config:
          can_create: true

  reminders:
    config:
      can_use: false
    overrides:
      - level: ">=0"
        config:
          can_use: true

  censor:
    config:
      filter_zalgo: true
      filter_invites: false
      allow_group_dm_invites: false
      filter_domains: false
      domain_blacklist: null
      blocked_tokens:
        - "arse"
        - "arsehead"
        - "arsehole"
        - "ass"
        - "asshole"
        - "bastard"
        - "bitch"
        - "brotherfucker"
        - "child-fucker"
        - "cock"
        - "cocksucker"
        - "dick"
        - "dick-head"
        - "dickhead"
        - "father-fucker"
        - "fatherfucker"
        - "fuck"
        - "fucked"
        - "fucker"
        - "fucking"
        - "mother fucker"
        - "mother-fucker"
        - "motherfucker"
        - "nigga"
        - "nigra"
        - "nigger"
        - "pigfucker"
        - "pussy"
        - "sisterfuck"
        - "sisterfucker"
      blocked_words:
        - "bloody"
        - "bullshit"
        - "crap"
        - "dammit"
        - "damn"
        - "damned"
        - "dumb-ass"
        - "dumbass"
        - "goddammit"
        - "goddamn"
        - "goddamned"
        - "goddamnit"
        - "godsdamn"
        - "jack-ass"
        - "jackass"
        - "piss"
        - "shit"
      blocked_regex: null
      notify_user: true
      notify_message: "Your message in **{guildName}** was removed. Reason: **{reason}**. Please keep the chat clean! 🙏"
    overrides:
      - level: ">=50"
        config:
          filter_zalgo: false
          filter_invites: false
          filter_domains: false
          blocked_tokens: []
          blocked_words: []
          blocked_regex: null

  welcome_message:
    config:
      send_dm: false
      send_to_channel: null   # SET: welcome channel ID, or leave null
      message: "Welcome to the server, {userMention(member)}! 👋"
      send_dm_delay: 3000

  persist:
    config:
      persisted_roles: []
      persist_nicknames: false
      persist_voice_mutes: false

  # ============================================================
  #  AIO / COMMUNITY (disabled until you fill IDs + enabled: true)
  #  Dashboard → AIO / Setup Guides for full examples
  # ============================================================

  voicemaster:
    config:
      enabled: false
      hub_channel_id: null
      category_id: null
      default_name: "{user}'s Channel"
      default_limit: 0

  tickets:
    config:
      enabled: false
      support_role_ids: []
      log_channel_id: null
      parent_category_id: null
      categories: {}

  giveaways:
    config:
      enabled: false

  leveling:
    config:
      enabled: false
      min_xp: 15
      max_xp: 25
      cooldown_seconds: 60

  verify:
    config:
      enabled: false
      verified_role_id: null
      unverified_role_id: null
      channel_id: null
      mode: button

  fun:
    config:
      enabled: true
      can_use: true

  social:
    config:
      enabled: true
      can_use: true

  modmail:
    config:
      enabled: false
      category_id: null
      staff_role_ids: []
      log_channel_id: null

  antinuke:
    config:
      enabled: false
      quarantine_role_id: null
      log_channel_id: null

  economy:
    config:
      enabled: false
      currency_name: coins

  music:
    config:
      enabled: false

  collection:
    config:
      enabled: false

  nsfw:
    config:
      enabled: false

  booster_roles:
    config:
      enabled: false
      booster_role_id: null
`;
