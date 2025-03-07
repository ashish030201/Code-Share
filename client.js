var socket = io();
 
console.log(socket);
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const l = console.log

function getEl(id) {
    return document.getElementById(id)
}

function scrollToBottom() {
  var textarea = document.getElementById('editor');
  textarea.scrollTop = textarea.scrollHeight;
}
scrollToBottom();
function scrollToBottom1() {
  var textarea = document.getElementById('input_text');
  textarea.scrollTop = textarea.scrollHeight;
}
scrollToBottom1();
function scrollToBottom2() {
  var textarea = document.getElementById('output_text');
  textarea.scrollTop = textarea.scrollHeight;
}
scrollToBottom2();

function scrollToBottom3() {
  let messages = document.querySelector("#message-container").lastElementChild;
  messages.scrollIntoView(({ behavior: 'smooth', block: 'nearest', inline: 'start' }));
  }

var params;
var peopl;

socket.on('connect', () => {
  console.log('connected to server');
  let searchQuery = window.location.search.substring(1);
   params = JSON.parse('{"' + decodeURI(searchQuery).replace(/&/g, '","').replace(/\+/g,' ').replace(/=/g,'":"') + '"}');
   console.log(params)
   joinRoom(params.room)
  socket.emit('join',params, function(err){
    if(err){
      alert(err);
      window.location.href = '/join.html';
    }
    else {
      console.log('No error');
      }
  })
});

socket.on('alert_user', name => {
  alert(`${name} tried to exit fullscreen`);
})
 

 

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})


socket.on('in_face', num => {
  peopl = num;
  document.getElementById('cap_people').innerText = `Total People in Session: ${peopl}`
  document.getElementById('cap_people').display = 'inline-block'
   
})

socket.on('user-connected', name => {
  appendMessage(`${name} joined the session`)
})

socket.on('user-disconnected', people => {
  appendMessage(`${people.name} left the session`)
  peopl = people.numP;
  document.getElementById('cap_people').innerText = `Total people in Session: ${peopl}`
  
})

socket.on('loadIt', (num) => {
  
  if(num == 1)
  document.querySelector(".loader").style.display = "inline-block"

  else 
  document.querySelector(".loader").style.display = "none"
})

 

const editor = getEl("editor")
const output = getEl("output_text")
const input = getEl("input_text")
const language = getEl("language")

const preResult = "Running..."

document.addEventListener(
  "fullscreenchange",
  function () {
    if (document.fullscreenElement) {
      socket.emit('noCheat')
    }

    else{
      socket.emit('cheat')
    }
  })

  document.addEventListener(
    "mozfullscreenchange",
    function () {
      if (document.mozFullScreen) {
        socket.emit('noCheat')
      }
  
      else{
        socket.emit('cheat')
      }
    })

    document.addEventListener(
      "webkitfullscreenchange",
      function () {
        if (document.webkitIsFullScreen) {
          socket.emit('noCheat')
      }
  
      else{
        socket.emit('cheat')
      }
    })
    
 socket.on('cheating', (val) => {
   if(val.num == 1)
   {
    document.getElementById("report").innerText = `${val.name} exited the full screen` 
    document.getElementById("report").style.display = "inline";
    document.getElementById("select_div").style.marginLeft = "9.2%";
   }

   else
   {
     console.log('Its working, yay!')
    document.getElementById("report").innerText = ""
   
    if(document.fullscreenElement)
    document.getElementById("cap_people").style.marginTop = "-1.9%"

    else
    document.getElementById("cap_people").style.marginTop = "0.0%"
    document.getElementById("select_div").style.marginLeft = "50.2%";
   }
 })

document.querySelector("#execute").addEventListener('click',(evt)=>{
  output.value = preResult;
  socket.send({msg: preResult, id:2});
  document.querySelector(".loader").style.display = "inline-block"
  const code = editor.value;
  const inp = input.value;
  const lang = language.value
  console.log(code)
  socket.emit('news',{code,inp,lang})
  socket.on('output', (msg)=> {
    document.querySelector(".loader").style.display = "none"
    console.log(msg.output)
    output.value = msg.output
    const text = output.value
    socket.send({msg:text, id:2})
    
  })
  
})


messageForm.addEventListener('submit', e => {
  e.preventDefault()
  let message = messageInput.value
  message = message.trim()

  if(message.length > 0){
 
  appendMessage1(`You: ${message}`)
  socket.emit('send-chat-message', {message: message, roomId: params.room})
  messageInput.value = ''
  }
  })
  
  function appendMessage(message) {
 
  const messageElement = document.createElement('div')
   
  messageElement.innerText = message
  messageContainer.append(messageElement)
 
  scrollToBottom3()
  }

  function appendMessage1(message) {
  
  const messageElement = document.createElement('div')
   
  messageElement.innerText = message
  messageContainer.append(messageElement)
  messageElement.style.marginLeft = 320 + "px"
  messageElement.style.display = "block"
 
  scrollToBottom3()
  }


language.addEventListener('change', (evt3) => {
  const text = language.value
  socket.send({msg:text, id:3})
})

editor.addEventListener('input', (evt) => {
    const text = editor.value
      socket.send({msg:text, id:0})  
})

output.addEventListener("input", (evt1) =>{
  const text = output.value
  socket.send({msg:text, id:2})
  
})
input.addEventListener('input', (evt2) => {
  const text = input.value
  socket.send({msg:text, id:1})

})
socket.on('message', (data) => {
  if(data.id == 0)
      editor.value = data.msg
  else if(data.id == 1)
    input.value = data.msg
  else if(data.id == 2) 
    output.value = data.msg
  else if(data.id == 3)
    language.value = data.msg
  scrollToBottom();
  scrollToBottom1();
  scrollToBottom2();
})

 

const videoChatContainer = document.getElementById('video-chat-container')
const localVideoComponent = document.getElementById('local-video')
const remoteVideoComponent = document.getElementById('remote-video')

 
const mediaConstraints = {
  audio: true,
  video: true,
}
let localStream
let remoteStream
let isRoomCreator
let rtcPeerConnection  
let roomId
let mic_switch = true;
let click = 1;

 
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

 
socket.on('room_created', async () => {
  console.log('Socket event callback: room_created')
  showVideoConference()
  await setLocalStream(mediaConstraints)
  isRoomCreator = true
})

socket.on('room_joined', async () => {
  console.log('Socket event callback: room_joined')
  showVideoConference()
  await setLocalStream(mediaConstraints)
  socket.emit('start_call', roomId)
})

socket.on('full_room', () => {
  console.log('Socket event callback: full_room')
 
  window.location.href = window.location.origin + '/error404.html'
  
})

 function joinRoom(room) {
  if (room === '') {
    alert('Please type a room ID')
  } else {
    roomId = room
     
    showVideoConference()
  }
}

function showVideoConference() {
  
  videoChatContainer.style = 'display: inline-block'
}

async function setLocalStream(mediaConstraints) {
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
  } catch (error) {
    console.error('Could not get user media', error)
  }

  localStream = stream
  localVideoComponent.srcObject = stream
}

socket.on('start_call', async () => {
  console.log('Socket event callback: start_call')

  if (isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    await createOffer(rtcPeerConnection)
  }
})

socket.on('webrtc_offer', async (event) => {
  console.log('Socket event callback: webrtc_offer')

  if (!isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    await createAnswer(rtcPeerConnection)
  }
})

socket.on('webrtc_answer', (event) => {
  console.log('Socket event callback: webrtc_answer')

  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

socket.on('webrtc_ice_candidate', (event) => {
  console.log('Socket event callback: webrtc_ice_candidate')

  
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  })
  rtcPeerConnection.addIceCandidate(candidate)
})

socket.on('dis', () => {
  remoteVideoComponent.style.backgroundColor= "black"
})
 
function addLocalTracks(rtcPeerConnection) {
  localStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, localStream)
  })
}

async function createOffer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createOffer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_offer', {
    type: 'webrtc_offer',
    sdp: sessionDescription,
    roomId,
  })
}

async function createAnswer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createAnswer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_answer', {
    type: 'webrtc_answer',
    sdp: sessionDescription,
    roomId,
  })
}

function setRemoteStream(event) {
  remoteVideoComponent.srcObject = event.streams[0]
  remoteStream = event.stream
}

function sendIceCandidate(event) {
  if (event.candidate) {
    socket.emit('webrtc_ice_candidate', {
      roomId,
      label: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    })
  }
}
