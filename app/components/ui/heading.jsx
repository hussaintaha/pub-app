import { Text, BlockStack, Box } from "@shopify/polaris";

/**
 * SectionHeading component for section titles within a page
 * Used for subsections of content
 */

export const SectionHeading = (
  {title,
  subtitle,
  as = "h2",
  variant = "headingMd",
  alignment = "start",
  gap = "100",
  titleTone,
  subtitleTone = "subdued",}
) => {
  return (
    <>
      <BlockStack gap={gap}>
        <Text as={as} variant={variant} alignment={alignment} tone={titleTone}>
          {title}
        </Text>
        {subtitle && (
          <Text
            as="p"
            variant="bodyMd"
            alignment={alignment}
            tone={subtitleTone}
          >
            {subtitle}
          </Text>
        )}
      </BlockStack>
    </>
  );
};