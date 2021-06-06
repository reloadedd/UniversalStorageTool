/* ======================
 * --- Global Imports ---
 * ======================
 */
const url = require("url");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { URLSearchParams } = require("url");


/* =====================
 * --- Local Imports ---
 * =====================
 */
const { generateRandomHex } = require("./cryptography.controller")


/* =================
 * --- Constants ---
 * =================
 */
const ONEDRIVE_TOKEN_GRANTING_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token'
const ONEDRIVE_AUTHORIZATION_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize'
const ONEDRIVE_MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com/v1.0'
const ONEDRIVE_SCOPE = 'Files.ReadWrite.All Files.ReadWrite.AppFolder Files.ReadWrite.Selected offline_access'
const ONEDRIVE_STATE = `ONEDRIVE_${generateRandomHex()}`;
const ONEDRIVE_LOCAL_REDIRECT = 'http://localhost:2999/onedrive/get_token'
const ONEDRIVE_REMOTE_REDIRECT = 'https://reloadedd.me:3000/onedrive/auth'


/* =================
 * --- Functions ---
 * =================
 */
function onOAuthAuthorization(req, res) {
  res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
    Location:
        `${ONEDRIVE_AUTHORIZATION_URL}?redirect_uri=` +
        (process.env.UNST_IS_SERVER_UP ? ONEDRIVE_REMOTE_REDIRECT : ONEDRIVE_LOCAL_REDIRECT) +
        `&client_id=${process.env.UNST_ONEDRIVE_CLIENT_ID}` +
        "&response_type=code" +
        "&response_mode=query" +
        `&scope=${ONEDRIVE_SCOPE}` +
        `&state=${ONEDRIVE_STATE}`
  });
  res.end();
}

async function onDriveAddition(req, res) {
  try {
    const userEmail = jwt.verify(
        req.body.jwtToken,
        req.UNST_JWT_SECRET,
    ).email;
    if (!req.body || !req.body.refreshToken) {
      throw new Error("Cannot add OneDrive because the request is invalid.");
    }

    const user = await req.db.users.findOne({
      where: { email: userEmail },
    });

    const drive = await req.db.onedrive.create({
      refreshToken: req.body.refreshToken,
    });

    user.setOneDrive(drive);

    res.writeHead(StatusCodes.OK, {
      "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
          message: "Drive account added.",
        }),
    );
  } catch (ex) {
    res.writeHead(StatusCodes.BAD_REQUEST, {
      "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
          message: "Bad data.",
        }),
    );
  }
}

async function getAvailableSpace(req, res) {
  const data = await (
      await fetch(`${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + req.OneDriveToken
        }
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
        totalSpace: data.quota.total,
        usedSpace: data.quota.used
      }),
  );
}

function verifyUserAuthenticated(req, res) {
  try {
    jwt.verify(req.jwtToken, req.UNST_JWT_SECRET);
    return true;
  } catch (ex) {
    res.writeHead(StatusCodes.TEMPORARY_REDIRECT, { Location: "/login" });
    res.end();
    return false;
  }
}

function printObject(jsonObj) {
  Array.from(Object.keys(jsonObj)).forEach(function(key) {
    console.log(key + ":" + jsonObj[key]);
  });
}

async function getTokensHavingCode(req, res) {
  const code = url.parse(req.url, true).query.code;

  if (!code) {
    return false;
  }

  let params = new URLSearchParams();
  params.append("client_id", process.env.UNST_ONEDRIVE_CLIENT_ID);
  params.append("scope", ONEDRIVE_SCOPE);
  params.append("code", code.toString());
  params.append("redirect_uri", process.env.UNST_IS_SERVER_UP ? ONEDRIVE_REMOTE_REDIRECT : ONEDRIVE_LOCAL_REDIRECT);
  params.append("grant_type", "authorization_code");
  params.append("client_secret", process.env.UNST_ONEDRIVE_CLIENT_SECRET);

  const data = await (await fetch(ONEDRIVE_TOKEN_GRANTING_URL,
      {
        method: "POST",
        body: params
      })).json();

  await fetch(
      process.env.UNST_IS_SERVER_UP ? "https://reloadedd.me:3000/onedrive/add" : "http://localhost:2999/onedrive/add",
      {
        method: "POST",
        body: JSON.stringify({
          refreshToken: data.refresh_token,
          jwtToken: req.jwtToken,
        }),
      },
  );

  res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
    Location: "/account",
    "Set-Cookie":
        "OneDriveToken=" +
        data.access_token +
        "; path=/; httpOnly; Max-Age=" +
        data.expires_in
  });

  return true;
}


/* ======================
 * --- Module Exports ---
 * ======================
 */
module.exports = {
  onOAuthAuthorization,
  onDriveAddition,
  getAvailableSpace,
  verifyUserAuthenticated,
  getTokensHavingCode,
  ONEDRIVE_STATE,
  ONEDRIVE_TOKEN_GRANTING_URL
}