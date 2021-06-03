const db = require("../app/models");
const router = require("../routes");
setSecrets = (req) => {
    req.UNST_JWT_SECRET = process.env.UNST_JWT_SECRET || "shh";
};

exports.setServerDataAndDispatch = (request, response) => {
    request.db = db;
    setSecrets(request);
    const chunks = [];
    let cookies;
    try {
        cookies = request.headers["cookie"]
            .split(";")
            .map((cookie) => cookie.trim());
    } catch (err) {
        console.log(err.message);
    }

    try {
        request.jwtToken = cookies
            .find((cookie) => cookie.startsWith("jwt="))
            .replace("jwt=", "");
    } catch {
        console.log("no jwt token");
    }
    try {
        request.gDriveToken = cookies
            .find((cookie) => cookie.startsWith("gDriveToken="))
            .replace("gDriveToken=", "");
    } catch {
        console.log("no google drive token");
    }
    try {
        request.dropboxToken = cookies
            .find((cookie) => cookie.startsWith("dropboxToken="))
            .replace("dropboxToken=", "");
    } catch {
        console.log("no dropbox token");
    }
    request.on("data", (chunk) => {
        chunks.push(chunk);
    });
    request.on("end", () => {
        try {
            request.body = JSON.parse(Buffer.concat(chunks).toString());
        } catch {
            console.log("no json body.. reverting to plain text");
            request.data = Buffer.concat(chunks);
        } finally {
            router.dispatch(request, response);
        }
    });
};
