const phoneSection =
    document.getElementById("phoneSection");

const otpSection =
    document.getElementById("otpSection");

const successSection =
    document.getElementById("successSection");

const phoneInput =
    document.getElementById("phone");

const phoneDisplay =
    document.getElementById("phoneDisplay");

const demoOtp =
    document.getElementById("demoOtp");

const timerElement =
    document.getElementById("timer");

const sendOtpBtn =
    document.getElementById("sendOtpBtn");

const verifyBtn =
    document.getElementById("verifyBtn");

const resendBtn =
    document.getElementById("resendBtn");

const changeNumberBtn =
    document.getElementById("changeNumberBtn");

const startAgainBtn =
    document.getElementById("startAgainBtn");

const message =
    document.getElementById("message");

const otpInputs =
    document.querySelectorAll(".otp-input");


let timerInterval;


/* --------------------------------
   SHOW MESSAGE
-------------------------------- */

function showMessage(text, type) {

    message.textContent = text;

    message.className = type;
}


/* --------------------------------
   CLEAR OTP INPUTS
-------------------------------- */

function clearOtpInputs() {

    otpInputs.forEach(input => {

        input.value = "";

    });

}


/* --------------------------------
   START TIMER
-------------------------------- */

function startTimer(seconds) {

    clearInterval(timerInterval);

    let remaining = seconds;

    timerElement.textContent = remaining;

    resendBtn.disabled = true;

    timerInterval = setInterval(() => {

        remaining--;

        timerElement.textContent = remaining;

        if (remaining <= 0) {

            clearInterval(timerInterval);

            timerElement.textContent = "0";

            resendBtn.disabled = false;

            showMessage(
                "OTP expired. You can request a new OTP.",
                "error"
            );

        }

    }, 1000);

}


/* --------------------------------
   SEND OTP
-------------------------------- */

sendOtpBtn.addEventListener(
    "click",
    async () => {

        const phone =
            phoneInput.value.trim();


        if (!phone) {

            showMessage(
                "Please enter your phone number.",
                "error"
            );

            return;

        }


        sendOtpBtn.disabled = true;

        sendOtpBtn.textContent =
            "Generating...";


        try {

            const response =
                await fetch(
                    "/send-otp",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                phone: phone
                            })
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                phoneDisplay.textContent =
                    phone;

                demoOtp.textContent =
                    data.otp;

                phoneSection.classList.add(
                    "hidden"
                );

                otpSection.classList.remove(
                    "hidden"
                );

                clearOtpInputs();

                otpInputs[0].focus();

                startTimer(
                    data.expires_in
                );

                showMessage(
                    "OTP generated successfully.",
                    "success-message"
                );

            } else {

                showMessage(
                    data.message,
                    "error"
                );

            }


        } catch (error) {

            console.error(error);

            showMessage(
                "Unable to connect to server.",
                "error"
            );

        }


        sendOtpBtn.disabled = false;

        sendOtpBtn.textContent =
            "Generate OTP";

    }
);


/* --------------------------------
   OTP INPUT
-------------------------------- */

otpInputs.forEach(
    (input, index) => {

        input.addEventListener(
            "input",
            () => {

                input.value =
                    input.value.replace(
                        /\D/g,
                        ""
                    );


                if (
                    input.value &&
                    index <
                    otpInputs.length - 1
                ) {

                    otpInputs[
                        index + 1
                    ].focus();

                }

            }
        );


        input.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key ===
                    "Backspace" &&
                    !input.value &&
                    index > 0
                ) {

                    otpInputs[
                        index - 1
                    ].focus();

                }

            }
        );

    }
);


/* --------------------------------
   VERIFY OTP
-------------------------------- */

verifyBtn.addEventListener(
    "click",
    async () => {

        let otp = "";

        otpInputs.forEach(
            input => {

                otp += input.value;

            }
        );


        if (otp.length !== 6) {

            showMessage(
                "Please enter all 6 digits.",
                "error"
            );

            return;

        }


        verifyBtn.disabled = true;

        verifyBtn.textContent =
            "Verifying...";


        try {

            const response =
                await fetch(
                    "/verify-otp",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                otp: otp
                            })
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                clearInterval(
                    timerInterval
                );

                otpSection.classList.add(
                    "hidden"
                );

                successSection.classList.remove(
                    "hidden"
                );

                showMessage(
                    data.message,
                    "success-message"
                );

            } else {

                showMessage(
                    data.message,
                    "error"
                );

            }


        } catch (error) {

            console.error(error);

            showMessage(
                "Unable to connect to server.",
                "error"
            );

        }


        verifyBtn.disabled = false;

        verifyBtn.textContent =
            "Verify OTP";

    }
);


/* --------------------------------
   RESEND OTP
-------------------------------- */

resendBtn.addEventListener(
    "click",
    async () => {

        resendBtn.disabled = true;

        resendBtn.textContent =
            "Generating...";


        try {

            const response =
                await fetch(
                    "/resend-otp",
                    {
                        method: "POST"
                    }
                );


            const data =
                await response.json();


            if (data.success) {

                demoOtp.textContent =
                    data.otp;

                clearOtpInputs();

                otpInputs[0].focus();

                startTimer(
                    data.expires_in
                );

                showMessage(
                    "New OTP generated.",
                    "success-message"
                );

            } else {

                showMessage(
                    data.message,
                    "error"
                );

            }


        } catch (error) {

            console.error(error);

            showMessage(
                "Unable to connect to server.",
                "error"
            );

        }


        resendBtn.textContent =
            "Resend OTP";

    }
);


/* --------------------------------
   CHANGE NUMBER
-------------------------------- */

changeNumberBtn.addEventListener(
    "click",
    async () => {

        await fetch(
            "/reset",
            {
                method: "POST"
            }
        );

        clearInterval(timerInterval);

        clearOtpInputs();

        otpSection.classList.add(
            "hidden"
        );

        phoneSection.classList.remove(
            "hidden"
        );

        phoneInput.value = "";

        phoneInput.focus();

        showMessage("", "");

    }
);


/* --------------------------------
   START AGAIN
-------------------------------- */

startAgainBtn.addEventListener(
    "click",
    async () => {

        await fetch(
            "/reset",
            {
                method: "POST"
            }
        );

        successSection.classList.add(
            "hidden"
        );

        phoneSection.classList.remove(
            "hidden"
        );

        phoneInput.value = "";

        clearOtpInputs();

        showMessage("", "");

        phoneInput.focus();

    }
);