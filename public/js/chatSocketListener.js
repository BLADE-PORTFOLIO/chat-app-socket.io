// Invalid User Redirects to Logout Page Blade
socket.on('invalidUser', (data) => { 
	location.replace('http://localhost:3000/logout');
});

// Socket Dynamic update user status Blade
socket.on('getOnlineUser', (data) => {
	const a = document.getElementById(data.user_id + '-status');
	if (a) {
		a.textContent = 'Online';
		document.getElementById(data.user_id + '-status').classList.remove('offline-status');
		document.getElementById(data.user_id + '-status').classList.add('online-status');
	}
});
socket.on('getOfflineUser', (data) => {
	const a = document.getElementById(data.user_id + '-status');
	if (a) {
		a.textContent = 'Offline';
		document.getElementById(data.user_id + '-status').classList.remove('online-status');
		document.getElementById(data.user_id + '-status').classList.add('offline-status');	
	}
});

// Load New Chat Blade
socket.on('loadNewChat', (data) => {
	if (sender_id === data.receiver_id['_id'] && receiver_id === data.sender_id['_id']) {
		let html = `
		<div class="distance-user-chat" id='`+data['_id']+`'>
			<h5>
				<span>
				`+data.message+`
				</span>
			</h5>
			`
		if (data.filename.length > 0) {
			for (let j = 0; j < data.filename.length; j++) { 
				html += `
				<a class="btn btn-success" href="http://localhost:3000/`+data.filename[j]+`" target="_blank">`+data.filename[j].split('\\')[1]+`</a>
				`
			}
		}
		html += `
		<div class="user-data">
			<img src="`+ data.sender_id['image'] + `" class="user-chat-image" />
			<b>`+data.sender_id['name'] +` </b>`+ getTimeContextMessage(data['createdAt']) +`
		</div>
		</div>
		`;
		document.getElementById('chat-container').insertAdjacentHTML('beforeend', html);
		scrollChat();
	} else if (sender_id === data.sender_id['_id'] && receiver_id === data.receiver_id['_id']) {
		let html = `
		<div class="current-user-chat" id='`+data['_id']+`'>
			<h5>
				<span>
				`+data.message+`
				</span>
				<i class="fa fa-trash" aria-hidden="true" data-id='`+data['_id']+`' data-toggle="modal" data-target="#deleteChatModal"></i>
				<i class="fa fa-edit" aria-hidden="true" data-id='`+data['_id']+`' data-msg='`+data['message']+`' data-toggle="modal" data-target="#editChatModal"></i>
			</h5>
			`
		if (data.filename.length > 0) {
			for (let j = 0; j < data.filename.length; j++) { 
				html += `
				<a class="btn btn-success" href="http://localhost:3000/`+data.filename[j]+`" target="_blank">`+data.filename[j].split('\\')[1]+`</a>
				`
			}
		}
		html += `
		<div class="user-data">
			<img src="` + data.sender_id['image'] + `" class="user-chat-image" />
			<b>Me </b>`+ getTimeContextMessage(data['createdAt']) +`
		</div>
		</div>
		`;
		document.getElementById('chat-container').insertAdjacentHTML('beforeend', html);
		scrollChat();
	}
});

// Load Old Chats Blade
socket.on('loadOldChats', (chats) => {
	document.getElementById('chat-container').innerHTML = '';
	let html = '';
	for (let i = 0; i < chats.length; i++) {
		const newChat = chats[i].message.replace("'", '&apos;');
		let addClass = '';
		if(chats[i]['sender_id']['_id'] === sender_id) {
			addClass = 'current-user-chat';
		} else {
			addClass = 'distance-user-chat';
		}

		if(addClass === 'current-user-chat') {
			html +=`
			<div class='`+addClass+`' id='`+chats[i]['_id']+`'>
				<h5>
					<span>
					`+chats[i]['message']+`
					</span>
					<i class="fa fa-trash" aria-hidden="true" data-id='`+chats[i]['_id']+`' data-toggle="modal" data-target="#deleteChatModal"></i>
					<i class="fa fa-edit" aria-hidden="true" data-id='`+chats[i]['_id']+`' data-msg='`+newChat+`' data-toggle="modal" data-target="#editChatModal"></i>
				</h5>`
			if(chats[i]['filename'].length > 0) {
				for (let j = 0; j < chats[i].filename.length; j++) { 
					html += `
					<a class="btn btn-success" href="http://localhost:3000/`+chats[i].filename[j]+`" target="_blank">`+chats[i].filename[j].split('\\')[1]+`</a>
					`
				}
			}
			html += `
			<div class="user-data">
				<img src="` + chats[i].sender_id['image'] + `" class="user-chat-image" />
				<b>Me </b>`+ getTimeContextMessage(chats[i]['createdAt']) +`
			</div>
			</div>
			`;
		} else {
			html +=`
			<div class='`+addClass+`' id='`+chats[i]['_id']+`'>
				<h5>
					<span>
					`+chats[i]['message']+`
					</span>
				</h5>`
			if(chats[i]['filename'].length > 0) {
				for (let j = 0; j < chats[i].filename.length; j++) { 
					html += `
					<a class="btn btn-success" href="http://localhost:3000/`+chats[i].filename[j]+`" target="_blank">`+chats[i].filename[j].split('\\')[1]+`</a>
					`
				}
			}
			html += `
			<div class="user-data">
				<img src="` + chats[i].sender_id['image'] + `" class="user-chat-image" />
				<b>`+chats[i].sender_id['name']+` </b>`+ getTimeContextMessage(chats[i]['createdAt']) +`
			</div>
			</div>
			`;
		}
	}
	document.getElementById('chat-container').insertAdjacentHTML('beforeend', html);
	scrollChat();
});

// Remove the deleted message from the document Blade
socket.on('chatMessageDeleted', (data) => {
	document.getElementById(data.id).remove();
});

// Update the updated message from the document Blade
socket.on('chatMessageUpdate', (data) => {
	document.getElementById(data.id).querySelector('span').textContent = data.message;
});