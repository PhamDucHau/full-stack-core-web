export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_WEBHOOK_URL: process.env.TELEGRAM_WEBHOOK_URL,
  AUTOMAKER_API_URL: process.env.AUTOMAKER_API_URL,
  AUTOMAKER_API_KEY: process.env.AUTOMAKER_API_KEY,
  AUTOMAKER_PROJECT_PATH: process.env.AUTOMAKER_PROJECT_PATH,
});