const { StatusCodes } = require("http-status-codes");
const fetch = require("node-fetch");
const fs = require("fs");
exports.getFile = async (req, res) => {
    const details = await (
        await fetch(
            "https://www.googleapis.com/drive/v3/files/" +
                "1-nZx1uvJA_4KS4cN8-3E80S9pB1PEc82" +
                "?fields=size,name,mimeType&key=" +
                process.env.UNST_GDRIVE_API_KEY,
            {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + req.gDriveToken,
                },
            },
        )
    ).json();
    fetch(
        "https://www.googleapis.com/drive/v3/files/" +
            "1-nZx1uvJA_4KS4cN8-3E80S9pB1PEc82" +
            "?alt=media&key=" +
            process.env.UNST_GDRIVE_API_KEY,
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + req.gDriveToken,
            },
        },
    ).then((response) => {
        res.writeHead(StatusCodes.OK, {
            "Content-Type": details.mimeType,
            "Content-Disposition": "attachment; filename=" + details.name,
            "Content-Length": details.size,
        });
        response.body.pipe(res);
    });
};
