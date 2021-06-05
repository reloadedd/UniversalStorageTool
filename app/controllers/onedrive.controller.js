/* ======================
 * --- Global Imports ---
 * ======================
 */
const url = require("url");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");


/* =====================
 * --- Local Imports ---
 * =====================
 */
const { generateRandomHex } = require("./cryptography.controller")


/* =================
 * --- Constants ---
 * =================
 */
const TOKEN_GRANTING_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token'
const AUTHORIZATION_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize'
const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com'
const SCOPE = 'Files.ReadWrite.All Files.ReadWrite.AppFolder Files.ReadWrite.Selected'
const STATE = `ONEDRIVE_${generateRandomHex()}`;
const LOCAL_REDIRECT = 'http://localhost:2999/onedrive/get_token'
const REMOTE_REDIRECT = 'https://reloadedd.me:3000/onedrive/auth'


/* =================
 * --- Functions ---
 * =================
 */
function onAuth(req, res) {
  res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
    Location:
        `${AUTHORIZATION_URL}?redirect_uri=` +
        (process.env.UNST_IS_SERVER_UP ? REMOTE_REDIRECT : LOCAL_REDIRECT) +
        `&client_id=${process.env.UNST_ONEDRIVE_CLIENT_ID}` +
        `&client_secret=${process.env.UNST_ONEDRIVE_CLIENT_SECRET}` +
        `&scope=${SCOPE}` +
        "&response_type=code" +
        "&response_mode=query" +
        "&grant_type=authorization_code" +
        `&state=${STATE}`
  });
  res.end();
}

async function onAdd(req, res) {
  try {
    const userEmail = jwt.verify(
        req.body.jwtToken,
        req.UNST_JWT_SECRET,
    ).email;
    if (!req.body || !req.body.refreshToken) throw new Error();

    const user = await req.db.users.findOne({
      where: { email: userEmail },
    });
    const drive = await req.db.googleDrives.create({
      refreshToken: req.body.refreshToken,
    });
    user.setGoogleDrive(drive);
    res.writeHead(StatusCodes.OK, {
      "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
          message: "Drive account added.",
        }),
    );
  } catch {
    res.writeHead(StatusCodes.BAD_REQUEST, {
      "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
          message: "Bad data.",
        }),
    );
  }
};

async function getSpace(req, res) {
  const data = await (
      await fetch("https://www.googleapis.com/drive/v2/about", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + req.gDriveToken,
        },
      })
  ).json();
  if (req.cookies) {
    res.writeHead(StatusCodes.OK, {
      "Content-Type": "application/json",
      "Set-Cookie": req.cookies,
    });
  } else {
    res.writeHead(StatusCodes.OK, {
      "Content-Type": "application/json",
    });
  }
  res.end(
      JSON.stringify({
        totalSpace: data.quotaBytesTotal,
        usedSpace: data.quotaBytesUsedAggregate,
      }),
  );
};

function verifyUserAuthenticated(req, res) {
  try {
    jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
    return false;
  } catch (ex) {
    res.writeHead(StatusCodes.TEMPORARY_REDIRECT, { Location: "/login" });
    res.end();
    return true;
  }
}

async function getTokenHavingCode(req, res) {
  const code = url.parse(req.url, true).query.code;

  if (!code) {
    return false;
  }

  const data = await (
      await fetch(TOKEN_GRANTING_URL, {
        method: "POST",
        body: JSON.stringify({
          code: code,
          client_id: process.env.UNST_ONEDRIVE_CLIENT_ID,
          client_secret: process.env.UNST_ONEDRIVE_CLIENT_SECRET,
          redirect_uri: process.env.UNST_IS_SERVER_UP
              ? "https://reloadedd.me:3000/account"
              : "http://localhost:2999/account",
          scope: SCOPE,
          grant_type: "authorization_code",
        }),
      })
  ).json();

  await fetch(
      process.env.UNST_IS_SERVER_UP
          ? "https://reloadedd.me:3000/g-drive/add"
          : "http://localhost:2999/g-drive/add",
      {
        method: "POST",
        body: JSON.stringify({
          refreshToken: data.refresh_token,
          jwtToken: req.jwtToken,
        }),
      },
  );

  res.writeHead(StatusCodes.OK, {
    "Set-Cookie":
        "OneDriveToken=" +
        data.access_token +
        "; path=/; httpOnly; Max-Age=" +
        data.expires_in,
    "Content-Type": "text/html",
  });

  return true;
}


/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = {
  onAuth,
  onAdd,
  getSpace,
  verifyUserAuthenticated,
  getTokenHavingCode,
  STATE
}