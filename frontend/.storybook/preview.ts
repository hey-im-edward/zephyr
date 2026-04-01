import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ["ZEPHYR"],
      },
    },
    backgrounds: {
      default: "zephyr",
      values: [
        {
          name: "zephyr",
          value: "linear-gradient(180deg, #eef2fb 0%, #f7f2ec 100%)",
        },
      ],
    },
    a11y: {
      test: "error",
    },
  },
};

export default preview;
