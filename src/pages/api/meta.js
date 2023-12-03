import { getLinkPreview } from "link-preview-js";
const AmazonListScraper = require("amazon-list-scraper").default;
var awl = new AmazonListScraper();

function parseMetas(str) {
  let regex = /<meta(?!.*?(ignore))[\s\S]*?\/?>/g;
  const data = {};
  if (regex.test(str)) {
    data.body = str.replace(regex, "");
    data.meta = str.match(regex).join("\n");
  }

  return data;
}

const ApiHandler = async function (req, res) {
  if (req.body) {
    const body = JSON.parse(req.body);
    let data;
    if (body.scrapeType === "product") {
      data = await getLinkPreview(body.link ?? "", {
        followRedirects: "follow",
        headers: {
          "user-agent": "Twitterbot",
        },
      }).catch((err) => {
        res.status(400).json({
          errorMsg:
            "Sorry, this website wasn't that easy to scrape. You'll need to do this the old fashioned way... ⌨️👇",
        });
      });

      if (data) {
        res.status(200).json(data);
      }
    }

    if (body.scrapeType === "list") {
      awl
        .scrape(body.link)
        .then(function (list) {
          data = list;
          if (data) {
            res.status(200).json(data);
          }
        })
        .catch((err) => console.error(err));
    }
  }
};

export default ApiHandler;
