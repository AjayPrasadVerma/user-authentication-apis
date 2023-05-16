
function handleSubmit() {

    return validate();
}

function validate() {

    const err = document.getElementById("err");
    const uname = document.getElementById("username");
    const pass = document.getElementById("password");
    const cpass = document.getElementById("cpassword");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;
    const inp = document.getElementsByTagName('input');

    for (i = 0; i < inp.length; i++) {

        if (inp[i].value == "") {
            inp[i].className += " invalid";
            err.innerText = "All field required!";
            valid = false;
        }
    }

    if (uname.value == "" || pass.value == "" || cpass.value == "") {
        err.innerText = 'All field required!';
        valid = false;
    }
    else if (!emailRegex.test(uname.value)) {
        err.innerText = 'Please enter valid email';
        uname.style.borderColor = "#d13434";
        valid = false;
    }
    else
        if (pass.value.length < 3) {
            err.innerHTML = "Password must contain minimun 8 character!";
            pass.style.borderColor = "#d13434";
            valid = false;
        }
        else if (pass.value != cpass.value) {
            err.innerHTML = "Password not matched!";
            cpass.style.borderColor = "#d13434";
            valid = false;
        }
        else {
            valid = true;
        }


    return (valid) ? true : false;

}