import { AlicePluginDocs } from "../../types.js";
import { trimPluginDescription } from "../../utils.js";
import { zWelcomeMessageConfig } from "./types.js";

export const welcomeMessagePluginDocs: AlicePluginDocs = {
  type: "stable",
  prettyName: "Welcome message",
  description: trimPluginDescription(`
    Greet new members with a channel message and/or DM.
    Admins can configure via \`!greet\` / \`!welcome\` (XEON-inspired setup UX) or YAML.

    **Components V2 note:** True Discord Components V2 welcome containers are deferred;
    Alice uses embeds + shared panel helpers until a CV2 renderer is adopted.
    Alice is free for all guilds — no paywall or premium gate on welcome features.
  `),
  configurationGuide: trimPluginDescription(`
    ~~~yml
    welcome_message:
      config:
        enabled: true
        send_dm: false
        send_to_channel: "123456789012345678"
        delete_after: null  # seconds, or null to keep
        content: "{member.mention}"
        embed_title: "Welcome!"
        embed_description: "Hey {member.mention}, welcome to **{guild.name}**!"
        embed_color: "#5865F2"
        embed_thumbnail: "{member.avatarURL}"
        # Or use classic message (string / embed object) when structured fields are unset:
        # message: "Welcome {member.mention}!"
    ~~~

    Commands (Manage Guild / level ≥50 by default): \`!greet setup\`, \`channel\`,
    \`content\`, \`title\`, \`description\`, \`color\`, \`thumbnail\`, \`image\`,
    \`message\`, \`deleteafter\`, \`test\`, \`config\`, \`variables\`, \`disable\`.
  `),
  configSchema: zWelcomeMessageConfig,
};
