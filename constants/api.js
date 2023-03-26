const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)
const openAI = JSON.parse(process.env.OPENAI_CONFIG)

module.exports = {
  firebaseConfig,
  openAI
};