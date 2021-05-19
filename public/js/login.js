async function doLogin() {
    let userName = document.getElementById("userName").value;
    let password = document.getElementById("password").value;
    let result = await fetch('login', {
        method: "POST",
        body: JSON.stringify({
            email: userName,
            password: password
        })
    });
    result = await result.json();
    if(result.message !== 'Set cookie'){
        document.getElementById("userName").style.borderColor = 'red';
        document.getElementById("password").style.borderColor = 'red';
    }
    else {
        location.href='account';
    }
}

async function doRegister() {
    let userName = document.getElementById("userName").value;
    let password = document.getElementById("password").value;
    let result = await fetch('register', {
        method: "POST",
        body: JSON.stringify({
            email: userName,
            password: password
        })
    });
    result = await result.json();
    if(result.message !== 'Set cookie'){
        console.log(result.message);
        document.getElementById("userName").style.borderColor = 'red';
        document.getElementById("password").style.borderColor = 'red';
    }
    else {
        location.href='account';
    }
}

async function doLogout() {
    let result = await fetch('logout', {
        method: 'POST'
    });
    result = await result.json();
    if(result.message === 'logged out'){
        location.href='login';
    }
}