// config/admin.ts

// --- Step 2: URL generation logic ---
const getPreviewPathname = (uid, { locale, document }): string => {
  const { slug } = document;

  // Handle different content types with their specific URL patterns
  switch (uid) {
    case "api::page.page":
      switch (slug) {
        case "homepage":
          return `/${locale}`; // localized homepage
        case "pricing":
          return "/pricing";
        case "contact":
          return "/contact";
        case "faq":
          return "/faq";
      }

    case "api::product.product": {
      if (!slug) {
        return "/products";
      }
      return `/products/${slug}`;
    }

    case "api::article.article": {
      if (!slug) {
        return "/blog";
      }
      return `/blog/${slug}`;
    }

    default:
      return null; // means: no preview for this content type
  }
};

// --- Step 3: main configuration ---
export default ({ env }) => {
  const clientUrl = env("CLIENT_URL", "http://localhost:3000");
  const previewSecret = env("PREVIEW_SECRET", "my-preview-secret");

  return {
    // Keep all your existing settings from before
    auth: {
      secret: env("ADMIN_JWT_SECRET"),
    },
    apiToken: {
      salt: env("API_TOKEN_SALT"),
    },
    transfer: {
      token: {
        salt: env("TRANSFER_TOKEN_SALT"),
      },
    },
    secrets: {
      encryptionKey: env("ENCRYPTION_KEY"),
    },
    flags: {
      nps: env.bool("FLAG_NPS", true),
      promoteEE: env.bool("FLAG_PROMOTE_EE", true),
    },

    // 👇 Add the preview feature here
    preview: {
      enabled: true,
      config: {
        allowedOrigins: clientUrl,
        async handler(uid, { documentId, locale, status }) {
          const document = await strapi.documents(uid).findOne({ documentId });
          const pathname = getPreviewPathname(uid, { locale, document });

          // No matching page → no preview button in admin
          if (!pathname) return null;

          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};
