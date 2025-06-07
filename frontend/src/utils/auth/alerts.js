import Swal from "sweetalert2";

export const showLoginError = (formData, errorMessage, navigate) => {
  Swal.fire({
    title: "Login Failed",
    html: `
      <p>We couldn't sign you in with the email "<strong>${formData.email}</strong>".</p>
      <p>This could mean:</p>
      <ul style="text-align: left; margin: 15px 0;">
        <li>• No account exists with this email</li>
        <li>• The password is incorrect</li>
        <li>• The account needs verification</li>
      </ul>
      <p>Would you like to <strong>create a new account</strong> with this email?</p>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3B82F6",
    cancelButtonColor: "#6B7280",
    confirmButtonText: "Yes, Create Account",
    cancelButtonText: "Try Again",
    width: "500px",
  }).then((result) => {
    if (result.isConfirmed) {
      navigate("/register", {
        state: {
          email: formData.email,
          message:
            "Complete the registration form below to create your account.",
        },
      });
    }
  });
};

export const showUnverifiedError = () => {
  Swal.fire({
    title: "Login Failed",
    text: "You're account needs to be verified via link sent to your Email Account.",
    icon: "question",
    width: "500px",
  });
};
