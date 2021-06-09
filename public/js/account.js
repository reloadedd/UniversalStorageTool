async function userInformationLoading() {
  const username = document.getElementById("username");
  const registerDate = document.getElementById("register-date");
  const uploadStats = document.getElementById("upload-stats");

  const metadata = await (await fetch("/account/metadata")).json();
  const spaceLeft = await (await fetch("/space")).json();

  const uploaded = spaceLeft.totalUsedSpace / (1024 * 1024 * 1024);
  const totalSpace = spaceLeft.totalSpace / (1024 * 1024 * 1024);

  username.innerHTML = ` ${metadata.username}`;
  registerDate.innerHTML = ` Registered on ${metadata.registerDate.split('T')[0]}`;
  uploadStats.innerHTML = ` ${uploaded.toPrecision(2)} / ${totalSpace.toPrecision(2)} GiB uploaded`;
}