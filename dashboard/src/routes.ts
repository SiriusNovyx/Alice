import { createRouter, createWebHistory } from "vue-router";
import { authGuard, authRedirectGuard, loginCallbackGuard } from "./auth";
import Splash from "./components/Splash.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Splash },

    { path: "/login", components: {}, beforeEnter: authRedirectGuard },
    { path: "/login-callback", component: {}, beforeEnter: loginCallbackGuard },

    // Privacy policy
    {
      path: "/privacy-policy",
      component: () => import("./components/PrivacyPolicy.vue"),
    },

    // Docs
    {
      path: "/docs",
      component: () => import("./components/docs/DocsLayout.vue"),
      children: [
        {
          path: "",
          redirect: "/docs/introduction",
        },
        {
          path: "introduction",
          component: () => import("./components/docs/Introduction.vue"),
        },
        {
          path: "configuration/configuration-format",
          component: () => import("./components/docs/ConfigurationFormat.vue"),
        },
        {
          path: "configuration/permissions",
          component: () => import("./components/docs/Permissions.vue"),
        },
        {
          path: "configuration/plugin-configuration",
          component: () => import("./components/docs/PluginConfiguration.vue"),
        },
        {
          path: "reference/argument-types",
          component: () => import("./components/docs/ArgumentTypes.vue"),
        },
        {
          path: "setup-guides/logs",
          component: () => import("./components/docs/Logs.vue"),
        },
        {
          path: "setup-guides/moderation",
          component: () => import("./components/docs/Moderation.vue"),
        },
        {
          path: "setup-guides/counters",
          component: () => import("./components/docs/Counters.vue"),
        },
        {
          path: "setup-guides/aio-plugins",
          component: () => import("./components/docs/AioPlugins.vue"),
        },
        {
          path: "setup-guides/voicemaster",
          component: () => import("./components/docs/aio/VoiceMasterSetup.vue"),
        },
        {
          path: "setup-guides/tickets",
          component: () => import("./components/docs/aio/TicketsSetup.vue"),
        },
        {
          path: "setup-guides/giveaways",
          component: () => import("./components/docs/aio/GiveawaysSetup.vue"),
        },
        {
          path: "setup-guides/leveling",
          component: () => import("./components/docs/aio/LevelingSetup.vue"),
        },
        {
          path: "setup-guides/verify",
          component: () => import("./components/docs/aio/VerifySetup.vue"),
        },
        {
          path: "setup-guides/fun-social",
          component: () => import("./components/docs/aio/FunSocialSetup.vue"),
        },
        {
          path: "setup-guides/modmail",
          component: () => import("./components/docs/aio/ModmailSetup.vue"),
        },
        {
          path: "setup-guides/antinuke",
          component: () => import("./components/docs/aio/AntiNukeSetup.vue"),
        },
        {
          path: "setup-guides/economy",
          component: () => import("./components/docs/aio/EconomySetup.vue"),
        },
        {
          path: "setup-guides/music",
          component: () => import("./components/docs/aio/MusicSetup.vue"),
        },
        {
          path: "setup-guides/collection-nsfw-booster",
          component: () => import("./components/docs/aio/CollectionNsfwBoosterSetup.vue"),
        },
        {
          path: "plugins/:pluginName/:tab?",
          component: () => import("./components/docs/Plugin.vue"),
        },
      ],
    },

    // Dashboard
    {
      path: "/dashboard",
      component: () => import("./components/dashboard/Layout.vue"),
      beforeEnter: authGuard,
      children: [
        {
          path: "",
          component: () => import("./components/dashboard/GuildList.vue"),
        },
        {
          path: "guilds/:guildId/info",
          component: () => import("./components/dashboard/GuildInfo.vue"),
        },
        {
          path: "guilds/:guildId/config",
          component: () => import("./components/dashboard/GuildConfigEditor.vue"),
        },
        {
          path: "guilds/:guildId/aio",
          component: () => import("./components/dashboard/GuildAioPlugins.vue"),
        },
        {
          path: "guilds/:guildId/access",
          component: () => import("./components/dashboard/GuildAccess.vue"),
        },
        {
          path: "guilds/:guildId/import-export",
          component: () => import("./components/dashboard/GuildImportExport.vue"),
        },
      ],
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
      };
    } else if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0 };
    }
  },
});
