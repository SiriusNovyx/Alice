import photon from "@silvia-odwyer/photon-node";
import { AttachmentBuilder, ChatInputCommandInteraction, Message } from "discord.js";
import fs from "fs";
import twemoji from "twemoji";
import { GuildPluginData } from "vety";
import { isContextInteraction, sendContextResponse } from "../../../pluginUtils.js";
import { downloadFile, isEmoji } from "../../../utils.js";
import { UtilityPluginType } from "../types.js";

const fsp = fs.promises;

async function getBufferFromUrl(url: string): Promise<Buffer> {
  const downloadedEmoji = await downloadFile(url);
  return fsp.readFile(downloadedEmoji.path);
}

function bufferToPhotonImage(input: Buffer): photon.PhotonImage {
  const base64 = input.toString("base64").replace(/^data:image\/\w+;base64,/, "");
  return photon.PhotonImage.new_from_base64(base64);
}

function photonImageToBuffer(image: photon.PhotonImage): Buffer {
  const base64 = image.get_base64().replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

function resizeBuffer(input: Buffer, width: number, height: number): Buffer {
  const photonImage = bufferToPhotonImage(input);
  photon.resize(photonImage, width, height, photon.SamplingFilter.Lanczos3);
  return photonImageToBuffer(photonImage);
}

export async function actualJumboCmd(
  pluginData: GuildPluginData<UtilityPluginType>,
  context: Message | ChatInputCommandInteraction,
  emoji: string,
) {
  const config = pluginData.config.get();
  const size = config.jumbo_size > 2048 ? 2048 : config.jumbo_size;
  const emojiRegex = new RegExp(`(<.*:).*:(\\d+)`);
  const results = emojiRegex.exec(emoji);
  let extension = ".png";
  let file: AttachmentBuilder | undefined;

  if (!isEmoji(emoji)) {
    await pluginData.state.common.sendErrorMessage(context, "Invalid emoji");
    return;
  }

  if (results) {
    let url = "https://cdn.discordapp.com/emojis/";
    if (results[1] === "<a:") {
      extension = ".gif";
    }
    url += `${results[2]}${extension}`;
    if (extension === ".png") {
      const image = resizeBuffer(await getBufferFromUrl(url), size, size);
      file = new AttachmentBuilder(image, { name: `emoji${extension}` });
    } else {
      const image = await getBufferFromUrl(url);
      file = new AttachmentBuilder(image, { name: `emoji${extension}` });
    }
  } else {
    let url = `${twemoji.base}${twemoji.size}/${twemoji.convert.toCodePoint(emoji)}${twemoji.ext}`;
    let image: Buffer | undefined;
    try {
      const downloadedBuffer = await getBufferFromUrl(url);
      image = resizeBuffer(downloadedBuffer, size, size);
    } catch {
      if (url.toLocaleLowerCase().endsWith("fe0f.png")) {
        url = url.slice(0, url.lastIndexOf("-fe0f")) + ".png";
        try {
          image = resizeBuffer(await getBufferFromUrl(url), size, size);
        } catch {
          // photon WASM failures are non-actionable
        }
      }
    }
    if (!image) {
      await pluginData.state.common.sendErrorMessage(context, "Error occurred while jumboing default emoji");
      return;
    }

    file = new AttachmentBuilder(image, { name: "emoji.png" });
  }

  if (isContextInteraction(context)) {
    await sendContextResponse(context, { files: [file] }, false);
  } else if (context.channel.isSendable()) {
    await context.channel.send({ files: [file] });
  }
}
