import { Icons } from "@/components/Icons";


export function html({ url, text }: { url: string, text: string })  {
    return ` 
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        .container {
            max-width: 700px;
            margin: auto;
            border: 10px solid #ddd;
            padding: 50px 20px;
            font-size: 110%;
        }

        .logo-container {
            display: flex;
            align-items: center;
        }

        .logo {
            height: 20px;
            /* Adjust the height as needed */
            margin-right: 10px;
        }

        .logo-text {
            font-size: 14px;
            font-weight: bold;
            color: rgb(0, 81, 128);
        }

        .verification-header {
            text-align: center;
            text-transform: capitalize;
            color: rgb(0, 81, 128);
        }

        .verification-message {
            font-size: medium;
            margin-top: 20px;
            margin-bottom: 40px;
        }

        .verify-button {
            padding: 10px 20px;
            font-weight: 600;
            background: rgb(46, 139, 209);
            color: #fff;
            font-size: 16px;
            border: none;
            cursor: pointer;
            display: block;
            text-decoration: none;
            width: fit-content;
        }

        .verify-button:hover {
            background: #3b9adf;
        }
    </style>
    <div class="container">
    <div class="logo-container">
        <span class="logo-text">Breadit</span>
    </div>
    <h2 class="verification-header">Verify your email</h2>
    <p class="verification-message">
        In order to start using your Breadit account, you need to confirm your email address.
    </p>
    <a href=${url} target="_blank" class="verify-button">${text}</a>

    <p class="verification-message" style="margin-top: 40px; margin-bottom: 20px;">
        If button doesn't work for any reason, you can also click on the link below.
    </p>

   <div style="word-wrap: break-word;">${url}</div>
</div>`
}