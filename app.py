from flask import Flask, render_template, request, jsonify, session
import secrets
import time

app = Flask(__name__)

# Secret key for Flask sessions
app.secret_key = secrets.token_hex(32)

# OTP settings
OTP_EXPIRY = 60
MAX_ATTEMPTS = 3


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/send-otp", methods=["POST"])
def send_otp():

    data = request.get_json()

    if not data or not data.get("phone"):
        return jsonify({
            "success": False,
            "message": "Please enter a phone number."
        }), 400

    phone = data["phone"].strip()

    # Basic phone validation
    if not phone.startswith("+"):
        return jsonify({
            "success": False,
            "message": "Enter the number with country code. Example: +919876543210"
        }), 400

    if not phone[1:].isdigit():
        return jsonify({
            "success": False,
            "message": "Phone number can contain only digits after +."
        }), 400

    if len(phone) < 10 or len(phone) > 16:
        return jsonify({
            "success": False,
            "message": "Invalid phone number."
        }), 400

    # Generate secure 6-digit OTP
    otp = str(secrets.randbelow(900000) + 100000)

    # Store OTP information in session
    session["phone"] = phone
    session["otp"] = otp
    session["otp_created"] = time.time()
    session["attempts"] = 0
    session["verified"] = False

    print("--------------------------------")
    print("OTP GENERATED")
    print("Phone:", phone)
    print("OTP:", otp)
    print("--------------------------------")

    return jsonify({
        "success": True,
        "message": "OTP generated successfully.",
        "otp": otp,
        "expires_in": OTP_EXPIRY
    })


@app.route("/verify-otp", methods=["POST"])
def verify_otp():

    data = request.get_json()

    if not data or not data.get("otp"):
        return jsonify({
            "success": False,
            "message": "Please enter the OTP."
        }), 400

    entered_otp = data["otp"].strip()

    # Check whether OTP exists
    if "otp" not in session:
        return jsonify({
            "success": False,
            "message": "No OTP found. Please request a new OTP."
        }), 400

    # Check attempts
    attempts = session.get("attempts", 0)

    if attempts >= MAX_ATTEMPTS:
        return jsonify({
            "success": False,
            "message": "Maximum attempts exceeded. Please request a new OTP."
        }), 400

    # Check expiry
    created_time = session.get("otp_created", 0)

    if time.time() - created_time > OTP_EXPIRY:

        session.pop("otp", None)

        return jsonify({
            "success": False,
            "message": "OTP has expired. Please request a new OTP."
        }), 400

    # Increase attempt count
    session["attempts"] = attempts + 1

    # Verify OTP
    if secrets.compare_digest(entered_otp, session["otp"]):

        session["verified"] = True

        # Remove OTP after successful verification
        session.pop("otp", None)

        return jsonify({
            "success": True,
            "message": "Phone number verified successfully!"
        })

    remaining = MAX_ATTEMPTS - session["attempts"]

    return jsonify({
        "success": False,
        "message": f"Invalid OTP. {remaining} attempt(s) remaining."
    }), 400


@app.route("/resend-otp", methods=["POST"])
def resend_otp():

    phone = session.get("phone")

    if not phone:
        return jsonify({
            "success": False,
            "message": "Please enter your phone number first."
        }), 400

    # Generate new OTP
    otp = str(secrets.randbelow(900000) + 100000)

    session["otp"] = otp
    session["otp_created"] = time.time()
    session["attempts"] = 0
    session["verified"] = False

    print("--------------------------------")
    print("NEW OTP GENERATED")
    print("Phone:", phone)
    print("OTP:", otp)
    print("--------------------------------")

    return jsonify({
        "success": True,
        "message": "New OTP generated.",
        "otp": otp,
        "expires_in": OTP_EXPIRY
    })


@app.route("/reset", methods=["POST"])
def reset():

    session.clear()

    return jsonify({
        "success": True
    })


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )