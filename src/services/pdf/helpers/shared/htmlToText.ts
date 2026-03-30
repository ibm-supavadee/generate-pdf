import { htmlToText } from "html-to-text";

export const toText = (input: string) =>
  htmlToText(input, {
    wordwrap: false,
    preserveNewlines: false,
    selectors: [
      {
        selector: "a",
        options: {
          ignoreHref: true,
        },
      },
    ],
  }).trim();
