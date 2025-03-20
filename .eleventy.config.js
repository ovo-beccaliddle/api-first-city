export default async function(eleventyConfig) {
  // Copy the exercises folder to the output
  eleventyConfig.addPassthroughCopy("workshop/exercises");

  eleventyConfig.addGlobalData("layout", "layout.njk");

  const { InputPathToUrlTransformPlugin } = await import("@11ty/eleventy");

	eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
  
  // Set markdown options for better rendering
  eleventyConfig.setLibrary("md", markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }));
  
  return {
    dir: {
      input: ".",  // Changed from "./index.md" which was incorrect
      output: "_site",
      includes: "_includes"
    },
    templateFormats: ["md", "njk", "html"]
  };
} 