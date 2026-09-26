import "dotenv/config";
import axios from "axios";

async function getLinkedInUrn(token, accountName) {
  if (!token) {
    console.log(`[${accountName}] No token found.`);
    return;
  }

  try {
    const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`\n--- ${accountName} ---`);
    console.log(`Name: ${response.data.given_name} ${response.data.family_name}`);
    console.log(`URN: ${response.data.sub}`);
    console.log(`Full URN: urn:li:person:${response.data.sub}`);
  } catch (error) {
    console.error(`[${accountName}] Failed to get URN:`, error.response?.data || error.message);
  }
}

async function main() {
  console.log("Retrieving LinkedIn URNs for your tokens...");
  
  await getLinkedInUrn(process.env.LI_ACCESS_TOKEN1 || process.env.LI_ACCESS_TOKEN, "Account 1");
  await getLinkedInUrn(process.env.LI_ACCESS_TOKEN2, "Account 2");
}

main();
