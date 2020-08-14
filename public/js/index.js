const socket = io()
const roomSelectTemplate = document.querySelector('#rooms-ddwn-template').innerHTML

socket.emit('index',() => {
    
})

socket.on('rooms', (data) => {
    const roomData = { rooms : [
        {value: 'geral', text: 'Geral', clients: data[0]},
        {value: 'tecnologia', text: 'Tecnologia',  clients: data[1]},
        {value: 'games', text: 'Games',  clients: data[2]},
        {value: 'desenvolvimento', text: 'Desenvolvimento',  clients: data[3]}
    ]}
    const html = Mustache.render(roomSelectTemplate, roomData)
    document.querySelector('#room-select').innerHTML = html
})

// socket.on('roomData', ({ room, users }) => {
//     const html = Mustache.render(sidebarTemplate, {
//         room,
//         users
//     })
//     document.querySelector('#sidebar').innerHTML = html
// })