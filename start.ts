import Bot from "./src/Bot";

process.on('unhandledRejection', (err, origin) => {
  console.log(`unhandledRejection -> ${err}`)
  console.log(origin)
});

process.on("uncaughtException", (err, origin) => {
  console.log(`uncaughtException -> ${err}`)
  console.log(origin)
});

new Bot()