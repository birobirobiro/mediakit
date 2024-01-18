const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

app.get("/", async (req, res) => {
  const socialMediaData = await getSocialMediaData();
  res.send(socialMediaData);
});

const getSocialMediaData = async () => {
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();

  const user = "birobirobiro";
  const url = `https://beacons.ai/${user}/mediakit`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Wait for the social media links to be present
  await page.waitForSelector('.mt-4 a[aria-label^="profile followers"]');

  const socialMediaData = await page.evaluate(() => {
    const socialMediaLinks = document.querySelectorAll(
      '.mt-4 a[aria-label^="profile followers"]'
    );
    const data = Array.from(socialMediaLinks, (link) => {
      const title = link.getAttribute("aria-label").split(" ")[2];
      const countText = link.querySelector(".font-bold").textContent.trim();
      let count = parseFloat(
        countText.replace(/k/i, "e3").replace(/m/i, "e6").replace(/,/g, "")
      );
      if (isNaN(count)) {
        count = countText; // If the count is not a number, keep it as text
      }
      return { title, count };
    });
    return data;
  });

  console.log(socialMediaData);

  await browser.close();

  return socialMediaData;
};
