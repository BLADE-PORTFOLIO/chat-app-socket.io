function getCookie(name) {
	const matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Set Scrollbar Height
function scrollChat() {
	let chatContainer = document.getElementById('chat-container');
	if (chatContainer) {
		chatContainer.scrollTop = chatContainer.scrollHeight;
	} else { 
		chatContainer = document.getElementById('group-chat-container');
		if (chatContainer) {
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}
	}
}

// Base64 encode
function getDataUrls(files) {
  const fileReadPromises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        resolve(event.target.result);
      };
      reader.onerror = function (error) {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  });
  return fileReadPromises;
}

// Set the time label for the messages in the chat
function getTimeContextMessage(data) {
	const date = new Date(data);
	const cDate = date.getDate();
	const cMonth = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
	const cYear = date.getFullYear();
	const CHours = (date.getHours()) <= 9 ? '0' + date.getHours() : (date.getHours()) <= 12 ? (date.getHours()) :  (date.getHours()) - 12;
	// const CHours = (date.getHours()) <= 9 ? '0' + date.getHours() : (date.getHours());
	const CMinutes = Math.floor((date.getTime() % 3600) / 60);
	const CSeconds = Math.floor((date.getTime() % 3600) % 60);
	const getFullDate = cDate + '-' + cMonth + '-' + cYear + ' ' + CHours + ':' + CMinutes + ':' + CSeconds;
	return getFullDate;
}

// Load Old Group Chats
function loadGroupChats() {
	socket.emit('loadGroupChats', { id: global_group_id });
	// fetch('/load-group-chats', {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	body: JSON.stringify({
	// 		group_id: global_group_id,
	// 	})
	// })
	// 	.then(res => res.json())
	// 	.then(res => {
	// 		if (res.success) {
	// 			document.getElementById('group-chat-container').innerHTML = '';
	// 			const chats = res.chats;
	// 			let html = '';
	// 			for (let i = 0; i < chats.length; i++) {
	// 				let className = 'distance-user-chat';
	// 				if (chats[i]['sender_id']['_id'] === sender_id) {
	// 					className = 'current-user-chat';
	// 				}
	// 				let chat = chats[i].message;
	// 				const newChat = chat.replace("'", '&apos;');
	// 				html += `
	// 				<div class="`+className+`" id="`+chats[i]['_id']+`">
	// 				<h5>
	// 					<span>
	// 					`+ newChat + `
	// 					</span>`
	// 				if (className == 'current-user-chat') { 
	// 					html += `
	// 					<i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='`+chats[i]['_id'] + `' data-toggle="modal" data-target="#deleteGroupChatModal"></i>
	// 					<i class="fa fa-edit editGroupChat" aria-hidden="true" data-id='`+ chats[i]['_id'] + `' data-msg='` + newChat + `' data-toggle="modal" data-target="#editGroupChatModal"></i>`
	// 				}
	// 				html += `
	// 				</h5>`;
	// 				if (chats[i].filename.length > 0) {
	// 					for (let j = 0; j < chats[i].filename.length; j++) { 
	// 						html += `
	// 						<a class="btn btn-success" href="http://localhost:3000/`+chats[i].filename[j]+`" target="_blank">`+chats[i].filename[j].split('\\')[1]+`</a>
	// 						`
	// 					}
	// 				}
	// 				if (className == 'current-user-chat') {
	// 					html += `
	// 					<div class="user-data">
	// 						<img src="`+chats[i]['sender_id']['image']+`" class="user-chat-image" />
	// 						<b>Me </b>`+getTimeContextMessage(chats[i]['createdAt'])+`
	// 					</div>`
	// 				} else {
	// 					html += `
	// 					<div class="user-data">
	// 					<img src="` + chats[i]['sender_id']['image'] + `" class="user-chat-image" />
	// 						<b>` + chats[i]['sender_id']['name'] + `</b>
	// 						` + getTimeContextMessage(chats[i]['createdAt']) + `
	// 					</div>`
	// 				}
	// 				html += `
	// 				</div>`;
	// 			}
	// 			document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
	// 			scrollChat();
	// 		} else {
	// 			alert(res.msg);
	// 		}
	// 	});
}

function getRandomString(length = 5) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  // Return the random string.
  return randomString;
}
