async function doLogin() {
    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;
    let result = await fetch("users/login", {
        method: "POST",
        body: JSON.stringify({
            email: userName,
            password: password,
        }),
    });
    result = await result.json();
    if (result.message !== "Set cookie") {
        document.getElementById("userName").style.borderColor = "red";
        document.getElementById("password").style.borderColor = "red";
    } else {
        location.href = "account";
    }
}

async function doRegister() {
    const userName = document.getElementById("userName").value;
    const password = document.getElementById("password").value;
    let result = await fetch("users/register", {
        method: "POST",
        body: JSON.stringify({
            email: userName,
            password: password,
        }),
    });
    result = await result.json();
    if (result.message !== "Set cookie") {
        console.log(result.message);
        document.getElementById("userName").style.borderColor = "red";
        document.getElementById("password").style.borderColor = "red";
    } else {
        location.href = "account";
    }
}

async function doLogout() {
    let result = await fetch("users/logout", {
        method: "POST",
    });
    result = await result.json();
    if (result.message === "logged out") {
        location.href = "login";
    }
}
