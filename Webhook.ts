export default () => {
    fetch(Bun.env.WEBHOOK!, {
        method: 'POST',
        body: JSON.stringify({ 'content': '<@811913211737014322> expired token' }),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(() => console.log('Webhook sent successfully!'))
        .catch(e => console.error(e))
}