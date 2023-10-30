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

// Load New Group Chat Message
socket.on('broadcastGroupMessage', (data) => {
	if (data.group_id == global_group_id) { 
		if (sender_id == data.sender_id['_id']) {
			let html = `
			<div class="current-user-chat" id='`+data['_id']+`'>
				<h5>
					<span>
					`+data.message+`
					</span>
					<i class="fa fa-trash" aria-hidden="true" data-id='`+data['_id']+`' data-toggle="modal" data-target="#deleteGroupChatModal"></i>
					<i class="fa fa-edit" aria-hidden="true" data-id='`+data['_id']+`' data-msg='`+data.message+`' data-toggle="modal" data-target="#editGroupChatModal"></i>
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
			document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
			scrollChat();
		} else {
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
				document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
				scrollChat();
		}
	}
})

// Load Old Group chat
socket.on('broadcastLoadGroupChats', (data) => {
	document.getElementById('group-chat-container').innerHTML = '';
	for (let i = 0; i < data.length; i++) {
		let html = '';
		if (sender_id == data[i].sender_id['_id']) {
			html = `
			<div class="current-user-chat" id='`+ data[i]['_id'] + `'>`
		} else {
			html = `
			<div class="distance-user-chat" id='`+ data[i]['_id'] + `'>`
		}
		html += `
		<h5>
			<span>
			`+ data[i].message + `
			</span>`
		if (sender_id == data[i].sender_id['_id']) {
			html += `
			<i class="fa fa-trash" aria-hidden="true" data-id='`+data[i]['_id']+`' data-toggle="modal" data-target="#deleteGroupChatModal"></i>
			<i class="fa fa-edit" aria-hidden="true" data-id='`+ data[i]['_id'] + `' data-msg='` + data[i].message +`' data-toggle="modal" data-target="#editGroupChatModal"></i>`
		}
		
		html += `
		</h5>`
		if (data[i].filename.length > 0) {
			for (let j = 0; j < data[i].filename.length; j++) {
				html += `
				<a class="btn btn-success" href="http://localhost:3000/`+ data[i].filename[j] + `" target="_blank">` + data[i].filename[j].split('\\')[1] + `</a>
				`
			}
		}
		html += `
			<div class="user-data">
				<img src="`+ data[i].sender_id['image'] + `" class="user-chat-image" />
				<b>`+ data[i].sender_id['name'] + ` </b>` + getTimeContextMessage(data[i]['createdAt']) + `
			</div>
		</>
		`;
		document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
		scrollChat();
	}
})

// socket.on('loadNewGroupChat', (data) => {
// 	if (global_group_id == data.group_id) { 
// 		let html = `
// 		<div class="distance-user-chat" id='`+ data['_id'] + `'>
// 				<h5>
// 					<span>
// 					`+ data.message + `
// 					</span>
// 				</h5>
// 				<div class="user-data">
// 					<img src="` + data['sender_id']['image'] + `" class="user-chat-image" />
// 					<b>` + data['sender_id']['name'] + `</b>`+ getTimeContextMessage(data['createdAt']) +`
// 				</div>
// 		</div>
// 		`;
// 		document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
// 		scrollChat();
// 	}	
// });

socket.on('groupChatMessageDeleted', (id) => {
	document.getElementById(id).remove();
});