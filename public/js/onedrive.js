function addOneDrive() {
  location.href = "onedrive/auth";
}

function getCookie(name) {
  // Split cookie string and get all individual name=value pairs in an array
  var cookieArr = document.cookie.split(";");

  // Loop through the array elements
  for(var i = 0; i < cookieArr.length; i++) {
    var cookiePair = cookieArr[i].split("=");

    /* Removing whitespace at the beginning of the cookie name
    and compare it with the given string */
    if(name == cookiePair[0].trim()) {
      // Decode the cookie value and return
      return decodeURIComponent(cookiePair[1]);
    }
  }

  // Return null if not found
  return null;
}

async function setOneDriveAvailableSpace() {
  const onedrive = document.getElementById("onedrive");
  console.log(getCookie("gDriveToken"));
  try {
    const data = await (await fetch("/onedrive/get_available_space")).json();
    if (data.totalSpace && data.usedSpace) {
      document.getElementById("onedrive-percentage").innerHTML =
          "(" +
          Math.round((data.usedSpace / data.totalSpace) * 100) +
          ' <span class="percentage">%</span> )';
      document.getElementsByClassName("onedrive-available-space").item(0).style.width =
          Math.round((data.usedSpace / data.totalSpace) * 100) + "%";
    } else {
      onedrive.parentNode.removeChild(onedrive);
    }
  } catch {
    onedrive.parentNode.removeChild(onedrive);
  }
}