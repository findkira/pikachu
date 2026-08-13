# Pikachu Telegram Userbot

A modular Telegram automation framework built with GramJS and Node.js. This repository utilizes a dynamic plugin architecture to manage and execute commands efficiently.

## Deployment via Render

Deploying to Render provides a stable, cloud-based environment for continuous operation. 

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/findkira/pikachu)

### Deployment Instructions
- Acquire your `API_ID` and `API_HASH` from the Telegram API development portal.
- Generate your `STRING_SESSION` using the Termux environment method detailed below.
- Select the Deploy to Render button.
- Input your `API_ID`, `API_HASH`, and `STRING_SESSION` when prompted by the Render configuration interface.
- Proceed with the deployment. The service will initialize automatically.

## Acquiring API Credentials
- Access the Telegram core portal at my.telegram.org.
- Navigate to the API development tools section.
- Complete the application registration form.
- Retrieve the assigned `api_id` and `api_hash`. Maintain strict confidentiality of these credentials.

## Generating the Session String (Termux)

To deploy the application to a cloud environment, a persistent session string is required. Execute the following commands in a Termux environment strictly to authenticate your account and generate this string.

```bash
pkg update && pkg upgrade -y
pkg install git nodejs -y
git clone [https://github.com/findkira/pikachu.git](https://github.com/findkira/pikachu.git)
cd pikachu
npm install --ignore-scripts
node --no-warnings pikachu.js
