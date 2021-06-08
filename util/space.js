const ONEDRIVE_MICROSOFT_GRAPH_URL = "https://graph.microsoft.com/v1.0";
const { StatusCodes } = require("http-status-codes");
const fetch = require("node-fetch");

module.exports = async (req, res) => {
    let totalUsedSpace = 0;
    let totalSpace = 0;
    if (req.gDriveToken) {
        const data = await (
            await fetch("https://www.googleapis.com/drive/v2/about", {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + req.gDriveToken,
                },
            })
        ).json();
        totalSpace += parseInt(data.quotaBytesTotal);
        totalUsedSpace += parseInt(data.quotaBytesUsedAggregate);
        console.log(totalSpace);
    }
    if (req.dropboxToken) {
        const data = await (
            await fetch("https://api.dropboxapi.com/2/users/get_space_usage", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + req.dropboxToken,
                },
            })
        ).json();
        console.log(data.allocation.allocated);
        totalSpace += parseInt(data.allocation.allocated);
        totalUsedSpace += parseInt(data.used);
    }
    if (req.OneDriveToken) {
        const data = await (
            await fetch(`${ONEDRIVE_MICROSOFT_GRAPH_URL}/me/drive/`, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + req.OneDriveToken,
                },
            })
        ).json();
        console.log(data.quota.total);
        totalSpace += parseInt(data.quota.total);
        totalUsedSpace += parseInt(data.quota.used);
    }
    res.writeHead(StatusCodes.OK, {
        "Content-Type": "application/json",
    });
    res.end(
        JSON.stringify({
            totalSpace,
            totalUsedSpace,
        }),
    );
    console.log(totalSpace);
};
