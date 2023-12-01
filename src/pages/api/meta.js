import { getLinkPreview } from "link-preview-js";

function parseMetas(str) {
  let regex = /<meta(?!.*?(ignore))[\s\S]*?\/?>/g;
  const data = {};
  if (regex.test(str)) {
    data.body = str.replace(regex, '');
    data.meta = str.match(regex).join('\n');
  }

  return data
}

const ApiHandler = async (req, res) => {
  if (req.body) {
    const body = JSON.parse(req.body);

    const data = await getLinkPreview(body.link ?? "", {
      followRedirects: "follow",
      headers:{
        "user-agent": "Twitterbot"
      },
    }).catch(err => {
      res.status(400).json({
        errorMsg: "Sorry, this website wasn't that easy to scrape. You'll need to do this the old fashioned way... ⌨️👇"
      })
    });
    
    console.log("**** data1", data);

    if (data) {
      res.status(200).json(data);
    }
  }
};

export default ApiHandler;