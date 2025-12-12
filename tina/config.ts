import { defineConfig } from "tinacms";

// Branch for version control
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  
  // For Tina Cloud (optional) - set these env vars if you want cloud editing
  // Otherwise, use local mode with `pnpm dev` which runs tinacms dev
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "home",
        label: "Home Page",
        path: "content",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          // Hero Section
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              {
                type: "string",
                name: "headline",
                label: "Headline",
                required: true,
              },
              {
                type: "string",
                name: "headlineHighlight",
                label: "Highlighted Text",
                description: "Text that appears highlighted in the headline",
              },
              {
                type: "string",
                name: "headlineSecondary",
                label: "Secondary Headline",
              },
              {
                type: "string",
                name: "subheadline",
                label: "Subheadline",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "inputPlaceholder",
                label: "Input Placeholder",
              },
              {
                type: "string",
                name: "ctaButtonText",
                label: "CTA Button Text",
              },
              {
                type: "string",
                name: "secondaryButtonText",
                label: "Secondary Button Text",
              },
            ],
          },
          // Mirror Section
          {
            type: "object",
            name: "mirror",
            label: "Mirror Section (Pain Points)",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "object",
                name: "cards",
                label: "Pain Point Cards",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "New Card",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Card Title",
                  },
                  {
                    type: "string",
                    name: "text",
                    label: "Card Text",
                    ui: {
                      component: "textarea",
                    },
                  },
                ],
              },
              {
                type: "string",
                name: "closingStatement",
                label: "Closing Statement",
              },
            ],
          },
          // How It Works Section
          {
            type: "object",
            name: "howItWorks",
            label: "How It Works Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "object",
                name: "steps",
                label: "Steps",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "New Step",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "iconName",
                    label: "Icon Name",
                    description: "Icon identifier: eye, lightning, or box",
                    options: ["eye", "lightning", "box"],
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Step Title",
                  },
                  {
                    type: "string",
                    name: "text",
                    label: "Step Description",
                    ui: {
                      component: "textarea",
                    },
                  },
                ],
              },
            ],
          },
          // Intelligence Section
          {
            type: "object",
            name: "intelligence",
            label: "Intelligence Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "string",
                name: "subtitle",
                label: "Section Subtitle",
              },
              {
                type: "object",
                name: "pillars",
                label: "Pillars",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "New Pillar",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "iconName",
                    label: "Icon Name",
                    description: "Icon identifier: search, target, or brain",
                    options: ["search", "target", "brain"],
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Pillar Title",
                  },
                  {
                    type: "string",
                    name: "text",
                    label: "Pillar Description",
                    ui: {
                      component: "textarea",
                    },
                  },
                ],
              },
            ],
          },
          // Trophy Section
          {
            type: "object",
            name: "trophy",
            label: "Trophy Section (What You Get)",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "string",
                name: "subtitle",
                label: "Section Subtitle",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "object",
                name: "videoTypes",
                label: "Video Types",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "New Video Type",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Title",
                  },
                  {
                    type: "string",
                    name: "subtitle",
                    label: "Subtitle",
                  },
                ],
              },
              {
                type: "object",
                name: "guarantee",
                label: "Guarantee",
                fields: [
                  {
                    type: "string",
                    name: "title",
                    label: "Guarantee Title",
                  },
                  {
                    type: "string",
                    name: "text",
                    label: "Guarantee Text",
                    ui: {
                      component: "textarea",
                    },
                  },
                ],
              },
              {
                type: "object",
                name: "galleryRow1",
                label: "Gallery Row 1",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "New Media",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "url",
                    label: "URL",
                  },
                  {
                    type: "string",
                    name: "type",
                    label: "Type",
                    options: ["image", "video"],
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Title",
                  },
                ],
              },
              {
                type: "object",
                name: "galleryRow2",
                label: "Gallery Row 2",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "New Media",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "url",
                    label: "URL",
                  },
                  {
                    type: "string",
                    name: "type",
                    label: "Type",
                    options: ["image", "video"],
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Title",
                  },
                ],
              },
              {
                type: "object",
                name: "galleryRow3",
                label: "Gallery Row 3",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "New Media",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "url",
                    label: "URL",
                  },
                  {
                    type: "string",
                    name: "type",
                    label: "Type",
                    options: ["image", "video"],
                  },
                  {
                    type: "string",
                    name: "title",
                    label: "Title",
                  },
                ],
              },
            ],
          },
          // Offer Section
          {
            type: "object",
            name: "offer",
            label: "Offer Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "string",
                name: "packageName",
                label: "Package Name",
              },
              {
                type: "string",
                name: "packageSubtitle",
                label: "Package Subtitle",
              },
              {
                type: "string",
                name: "price",
                label: "Price",
              },
              {
                type: "string",
                name: "priceNote",
                label: "Price Note",
              },
              {
                type: "string",
                name: "features",
                label: "Features",
                list: true,
              },
              {
                type: "string",
                name: "ctaButtonText",
                label: "CTA Button Text",
              },
            ],
          },
          // FAQ Section
          {
            type: "object",
            name: "faq",
            label: "FAQ Section",
            fields: [
              {
                type: "string",
                name: "title",
                label: "Section Title",
              },
              {
                type: "object",
                name: "items",
                label: "FAQ Items",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.question || "New Question",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "question",
                    label: "Question",
                  },
                  {
                    type: "string",
                    name: "answer",
                    label: "Answer",
                    ui: {
                      component: "textarea",
                    },
                  },
                ],
              },
            ],
          },
          // Footer Section
          {
            type: "object",
            name: "footer",
            label: "Footer Section",
            fields: [
              {
                type: "string",
                name: "copyright",
                label: "Copyright Text",
              },
              {
                type: "string",
                name: "description",
                label: "Description",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "object",
                name: "links",
                label: "Footer Links",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.text || "New Link",
                  }),
                },
                fields: [
                  {
                    type: "string",
                    name: "text",
                    label: "Link Text",
                  },
                  {
                    type: "string",
                    name: "href",
                    label: "Link URL",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
