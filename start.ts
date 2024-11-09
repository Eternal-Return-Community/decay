import Bot from "./src/Bot";

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error(err, origin)
});

new Bot().start()