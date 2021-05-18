async function doLogin() {
    let userName = document.getElementById("userName").value;
    let password = document.getElementById("password").value;
    let bd = {email: userName, password};

    console.log(bd);
    let result = await fetch('login', {
        method: "POST",
        body: JSON.stringify({
            email: userName,
            password: password
        })
    });
    result = await result.json();
    if(result.message){
        alert("bad!");
    }
    else if(result.jwt) {
        alert("Logged in :)))))");
    }
}

function doRegister() {
    console.log("registering");
}