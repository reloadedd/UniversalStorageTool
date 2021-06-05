/* Module imports */
const { StatusCodes } = require("http-status-codes");

/* Custom constants */
const AUTHORIZATION_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize'
const TOKEN_GRANTING_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token'
const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com'
const SCOPE = 'Files.ReadWrite.All Files.ReadWrite.AppFolder Files.ReadWrite.Selected'
const STATE = 'ONEDRIVE'
const LOCAL_REDIRECT = 'http://localhost:2999/account'
const REMOTE_REDIRECT = 'https://reloadedd.me:3000/onedrive/auth'

exports.onAuth = (req, res) => {
  res.writeHead(StatusCodes.TEMPORARY_REDIRECT, {
    Location:
        `${AUTHORIZATION_URL}?redirect_uri=` +
        (process.env.UNST_IS_SERVER_UP ?  REMOTE_REDIRECT : LOCAL_REDIRECT) +
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

exports.onAdd = async (req, res) => {
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

exports.getSpace = async (req, res) => {
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