const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const translate = require("../translate");
const { setDefaultAlt } = require("./helpers");
const getImageDimensions = require("../get-image-dimensions");

const lazyLoadHandler = async (html, title) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const images = [...document.getElementsByTagName("img")];
  const iframes = [...document.getElementsByTagName("iframe")];

  await Promise.all(
    images.map(async (image) => {
      // To do: swap out the image URLs here once we have them auto synced
      // with an S3 bucket
      const { width, height } = await getImageDimensions(image.src, title);

      image.setAttribute("width", width);
      image.setAttribute("height", height);

      if (!image.alt) setDefaultAlt(image);

      image.setAttribute("loading", "lazy");
    }),

    iframes.map(async (iframe) => {
      iframe.setAttribute("title", `${translate("embed-title")}`);

      iframe.setAttribute("loading", "lazy");
    })
  );

  // The jsdom parser wraps the incomplete HTML from the Ghost
  // API with HTML, head, and body elements, so return whatever
  // is within the new body element it added
  return dom.window.document.body.innerHTML;
};

module.exports = lazyLoadHandler;
