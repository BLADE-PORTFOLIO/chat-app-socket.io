const windowHeight = window.innerHeight;

const fullHeightElements = document.querySelectorAll('.js-fullheight');
fullHeightElements.forEach(element => element.style.height = `${windowHeight}px`);

window.addEventListener('resize', () => {
  fullHeightElements.forEach(element => element.style.height = `${windowHeight}px`);
});

const sidebarCollapseElement = document.getElementById('sidebarCollapse');
if (sidebarCollapseElement) {
	sidebarCollapseElement.addEventListener('click', () => {
		const sidebarElement = document.getElementById('sidebar');
		sidebarElement.classList.toggle('active');
	});
}

// ----------------------------------------------- Dynamic Chat Application -----------------------------------------------
// Variables

// Socket Initialized Code

// When the user clicks on a user in the chat list Blade
const userList = document.querySelectorAll('.user-list');
if (userList) {
	userList.forEach(function (user) {
		user.addEventListener('click', function () {
			receiver_id = this.getAttribute('data-id');

			document.querySelector('.start-head').style.display = 'none';
			document.querySelector('.chat-section').style.display = 'block';

			const name = this.innerText;
			const temp = name.split(' ');
			temp.pop();

			document.getElementById('userName').textContent = temp.join(' ');
			socket.emit('existsChat', {
				sender_id: sender_id,
				receiver_id: receiver_id
			});
		});
	});
}

// Save chat of user Blade
const chatForm = document.getElementById('chat-form');
if (chatForm) {
	chatForm.addEventListener('submit', async function (event) {
		event.preventDefault();

		const message = document.getElementById('message').value;
		document.getElementById('message').value = '';
		const files = document.getElementById('file').files;

		if (!message && files.length === 0) {
			alert('Please provide a message or a file');
			return;
		}

		const obj = {};
		obj['sender_id'] =  sender_id;
		obj['receiver_id'] = receiver_id;
		obj['message'] = message;
		obj['files'] = [];
		obj['filename'] = [];

		const fileDataUrls = getDataUrls(files);
		Promise.all(fileDataUrls).then(fileDataUrls => {
			for (let i = 0; i < fileDataUrls.length; i++) {
				obj['files'].push(fileDataUrls[i]);
				obj['filename'].push(files[i].name);
			}

			socket.emit('saveUserChat', obj, function (error, data) { 
				if (error) {
					console.log(error);
				}
			});
		})
		.catch(error => {
			console.error('Error reading files:', error);
		});
	});
}

// Delete User Chat Message Click
document.addEventListener('click', function(event) {
	if (!event.target.matches('.fa-trash')) return;
	const msg = event.target.parentElement.textContent;
	if (msg) {
		const a = document.getElementById('delete-message');
		if (a) {
			a.textContent = msg;
		}
		const b = document.getElementById('delete-message-id');
		if (b) {
			b.value = event.target.getAttribute('data-id');
		}
	}
});

// Delete User Message Submit 
const deleteChatForm = document.getElementById('delete-chat-form');
if (deleteChatForm) {
	deleteChatForm.addEventListener('submit', function (event) {
		event.preventDefault();
		const id = document.getElementById('delete-message-id').value;

		socket.emit('chatDeleted', { id: id }, function (error, data) {
			if (error) {
				alert(error.message);
			} else {
				$('.close').click();
			}
		});
	});
}

//Update User Chat Click Blade
document.addEventListener('click', function(event) {
	if (!event.target.matches('.fa-edit')) return;
	const a = document.getElementById('edit-message-id')
	if (a) {
		a.value = event.target.getAttribute('data-id');
	}
	const b = document.getElementById('update-message');	
	if (b) {
		b.value = event.target.getAttribute('data-msg');	
	}
});

// Update User Chat Submit
const updateChatForm = document.getElementById('update-chat-form');
if (updateChatForm) {
	updateChatForm.addEventListener('submit', function (event) {
		event.preventDefault();

		const id = document.getElementById('edit-message-id').value;
		const message = document.getElementById('update-message').value;

		socket.emit('chatMessageUpdated', { id: id, message: message }, function (error, data) {
			console.log(data);
			if (error) { 
				alert(error.message);
			} else {
				$('.close').click();
				document.getElementById(data.id).querySelector('span').textContent = data.message;
				document.getElementById(data.id).querySelector('.fa-edit').setAttribute('data-msg', data.message); 	
			}
		});
	});
}

// Add Members Groups
const addMember = document.querySelectorAll('.addMember')
if (addMember) {
	Array.from(addMember).forEach(function (member) {
		member.addEventListener('click', function (event) {
			const id = this.getAttribute('data-id');
			const limit = this.getAttribute('data-limit');
	
			document.querySelector('#group_id').value = id;
			document.querySelector('#limit').value = limit;

			fetch('/get-members', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					group_id: id
				})
			})
			.then(res => res.json())
			.then(res => {
				if (res.success === true) {
					let users = res.data;
					let html = ''
					for (let i = 0; i < users.length; i++) {
						let isMemberOfGroup = users[i]['member'].length > 0 ? true : false;
						html += `
						<tr>
							<td>
								<input type="checkbox" `+ (isMemberOfGroup ? 'checked' : '') + ` name="members[]" value="` + users[i]['_id'] + `"/>
							</td>
							<th>
								`+ users[i]['name'] + `
							</th>
						</tr>
						`;
					}
					document.querySelector('.addMembersInTable').innerHTML = html;
					const myDiv = document.querySelector('.modal-backdrop');
					if (myDiv) {
						myDiv.parentNode.removeChild(myDiv);
					}
				} else {
					alert(res.msg);
				}
			});
		});
	});
}

// Update Group Details
const updateGroup = document.getElementsByClassName('updateGroup');
if (updateGroup) {
	Array.from(updateGroup).forEach(function (member) { 
		member.addEventListener('click', function() {
			const obj = JSON.parse(this.getAttribute('data-obj'));
			document.querySelector('#update_group_id').value = obj._id;
			document.querySelector('#last_limit').value = obj.limit;
			document.querySelector('#group_name').value = obj.name;
			document.querySelector('#group_limit').value = obj.limit;
		});
	})
}

// Update Group Details Submit
const updateChatGroupForm = document.querySelector('#updateChatGroupForm');
if (updateChatGroupForm) { 
	updateChatGroupForm.addEventListener('submit', function (event) { 
		event.preventDefault();
		
		const data = new FormData(document.querySelector('#updateChatGroupForm'));

		fetch('/update-chat-group', {
			method: 'POST',
			body: data,
		})
		.then(res => res.json())
		.then(res => { 
			alert(res.msg);
			if (res.success === true) { 
				location.reload();
			}
		})
	})
}

// Delete Group Details Click
var deleteGroupClick = document.querySelectorAll('.deleteGroup');
if (deleteGroupClick) {
	deleteGroupClick.forEach(function(deleteGroup) {
		deleteGroup.addEventListener('click', function() {
			const dataId = this.getAttribute('data-id');
			const name = this.getAttribute('data-name');
			if (dataId && name) {
				const a = document.querySelector('#delete_group_id')
				if (a) {
					a.value = dataId;
				}
				const b = document.querySelector('#delete-group-name')
				if (b) {
					b.textContent = name;
				}
			}
		});
	});
}

// Delete Group Details Submit
const deleteGroupDelete = document.querySelector('#deleteChatGroupForm');
if (deleteGroupDelete) {
	deleteGroupDelete.addEventListener('submit', function (event) {
		event.preventDefault();
		
		const data = new FormData(deleteGroupDelete);
		const params = new URLSearchParams(data).toString();
		if (params) {
			fetch('/delete-chat-group', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: params,
			})
				.then(res => res.json())
				.then(res => {
					alert(res.msg);
					if (res.success === true) {
						location.reload();
					}
				});
		};
	});
}

// Copy Shareable Link Click
const copyClick = document.querySelectorAll('.copy');
if (copyClick) {
		copyClick.forEach(function (element) {
		element.addEventListener('click', function () {
			this.insertAdjacentHTML('afterbegin', '<span class="copied_text">Copied</span>');
			const group_id = this.getAttribute('data-id');
			const url = window.location.host + '/share-group/' + group_id;

			const temp = document.createElement('input');
			document.body.appendChild(temp);
			temp.value = url;
			temp.select();
			document.execCommand('copy');

			document.body.removeChild(temp);

			setTimeout(function () {
				document.querySelector('.copied_text').remove();
			}, 2000);
		});
	});
}

// Join Group Sharable Link
const joinNow = document.querySelector('.join-now');
if (joinNow) {
	joinNow.addEventListener('click', function () {
		this.textContent = 'Wait...';
		this.disabled = true;
		const group_id = this.getAttribute('data-id');
		
		fetch('/join-group', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				group_id: group_id
			})
		})
			.then(res => res.json())
			.then(res => {
				alert(res.msg);
				if (res.success === true) { 
					location.reload();
				} else {
					this.textContent = 'Join Now';
					this.removeAttribute('disabled');
				}
			});
	});
}

//Group Chat Dialog Show Click
const groupList = document.querySelectorAll('.group-list');
if (groupList) {
	groupList.forEach(function (group) {
		group.addEventListener('click', function () {
			document.querySelector('.group-start-head').style.display = 'none';
			document.querySelector('.group-chat-section').style.display = 'block';
			global_group_id = this.getAttribute('data-id');

			loadGroupChats();
		});
	});
}

// Save Group Chat
const groupChatForm = document.getElementById('group-chat-form');
if (groupChatForm) {
	groupChatForm.addEventListener('submit', function (event) {
		event.preventDefault();

		const message = document.getElementById('group-message').value;

		fetch('/group-chat-save', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sender_id: sender_id,
				group_id: global_group_id,
				message: message
			})
		})
		.then(res => res.json())
		.then(res => {
			if (res.success === true) {
				document.getElementById('group-message').value = '';
				let chat = res.chat.message;
				const newChat = chat.replace("'", '&apos;');
				let html = `
				<div class="current-user-chat" id='`+ res.chat['_id'] + `'>
						<h5>
							<span>
							`+ newChat + `
							</span>
							<i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='`+ res.chat['_id'] + `' data-toggle="modal" data-target="#deleteGroupChatModal"></i>
							<i class="fa fa-edit editGroupChat" aria-hidden="true" data-id='`+ res.chat['_id'] + `' data-msg='` + newChat + `' data-toggle="modal" data-target="#editGroupChatModal"></i>
						</h5>
						<div class="user-data">
							<img src="` + res.chat['image'] + `" class="user-chat-image" />
							<b>Me </b>`+ getTimeContextMessage(res.chat['createdAt']) +`
						</div>
				</div>
				`;
				document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
				scrollChat();
				socket.emit('newGroupChat', res.chat);
			} else {
				alert(res.msg);
			}
		});
	});
}

// load new group chat
socket.on('loadNewGroupChat', (data) => {
	if (global_group_id == data.group_id) { 
		let html = `
		<div class="distance-user-chat" id='`+ data['_id'] + `'>
				<h5>
					<span>
					`+ data.message + `
					</span>
				</h5>
				<div class="user-data">
					<img src="` + data['sender_id']['image'] + `" class="user-chat-image" />
					<b>` + data['sender_id']['name'] + `</b>`+ getTimeContextMessage(data['createdAt']) +`
				</div>
		</div>
		`;
		document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
		scrollChat();
	}	
});

// Load Old Group Chats
function loadGroupChats() {
	fetch('/load-group-chats', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			group_id: global_group_id,
		})
	})
		.then(res => res.json())
		.then(res => {
			if (res.success) {
				document.getElementById('group-chat-container').innerHTML = '';
				const chats = res.chats;
				let html = '';
				for (let i = 0; i < chats.length; i++) {
					let className = 'distance-user-chat';
					if (chats[i]['sender_id']['_id'] === sender_id) {
						className = 'current-user-chat';
					}
					let chat = chats[i].message;
					const newChat = chat.replace("'", '&apos;');
					html += `
					<div class="` + className + `" id="` + chats[i]['_id'] + `">
					<h5>
						<span>
						`+ newChat + `
						</span>`
					if (className == 'current-user-chat') { 
						html += `
						<i class="fa fa-trash deleteGroupChat" aria-hidden="true" data-id='`+chats[i]['_id'] + `' data-toggle="modal" data-target="#deleteGroupChatModal"></i>
						<i class="fa fa-edit editGroupChat" aria-hidden="true" data-id='`+ chats[i]['_id'] + `' data-msg='` + newChat + `' data-toggle="modal" data-target="#editGroupChatModal"></i>`
					}
					html += `
					</h5>`;
					if (className == 'current-user-chat') {
						html += `
						<div class="user-data">
							<img src="` + chats[i]['sender_id']['image'] + `" class="user-chat-image" />
							<b>Me </b>`+ getTimeContextMessage(chats[i]['createdAt']) +`
						</div>`
					} else {
						html += `
						<div class="user-data">
						<img src="` + chats[i]['sender_id']['image'] + `" class="user-chat-image" />
							<b>` + chats[i]['sender_id']['name'] + `</b>
							` + getTimeContextMessage(chats[i]['createdAt']) + `
						</div>`
					}
					html += `
					</div>`;
				}
				document.getElementById('group-chat-container').insertAdjacentHTML('beforeend', html);
				scrollChat();
			} else {
				alert(res.msg);
			}
		});
}

// delete group chat message button click
document.addEventListener('click', function(event) {
	if (!event.target.closest('.deleteGroupChat')) return;
	const span = event.target.parentElement.querySelector('span');
	if (!span) return;
	const msg = span.innerText;

	const a = document.getElementById('delete-group-message');
	if (a) {
		a.textContent = msg;
	}
	const b = document.getElementById('delete-group-message-id');
	if (b) {
		b.value = event.target.getAttribute('data-id');
	}
});

// delete group chat message button Submit
const deleteGroupChatForm = document.querySelector('#delete-group-chat-form');
if (deleteGroupChatForm) { 
	deleteGroupChatForm.addEventListener('submit', function (event) { 
		event.preventDefault();
		const id = document.getElementById('delete-group-message-id').value;

		fetch('/delete-group-chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: id
			})
		})
		.then(res => res.json())
		.then(data => {
			if (data.success === true) {
				document.getElementById(id).remove();
				$('.close').click();
				// document.getElementById('deleteGroupChatModal').style.display = 'none';
				// const myDiv = document.querySelector('.modal-backdrop');
				// myDiv.parentNode.removeChild(myDiv);
				socket.emit('groupChatDeleted', id);
			} else {
				alert(data.msg);
			}
		});
	});
}

socket.on('groupChatMessageDeleted', (id) => {
	document.getElementById(id).remove();
});

// Update GroupChat Click
document.addEventListener('click', (event) => {
	if (!event.target.matches('.fa-edit')) return;
	const a = document.getElementById('edit-group-message-id')
	if (a) {
		a.value = event.target.getAttribute('data-id');
	}
	const b = document.getElementById('update-group-message');
	if (b) {
		b.value = event.target.getAttribute('data-msg');
	}
});

// Update group chat message button Submit
const updateGroupChatForm = document.querySelector('#update-group-chat-form');
if (updateGroupChatForm) {
	updateGroupChatForm.addEventListener('submit', function (event) {
		event.preventDefault();

		const id = document.getElementById('edit-group-message-id').value;
		const msg = document.getElementById('update-group-message').value;

		fetch('/update-group-chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				id: id,
				message: msg
			})
		})
		.then(res => res.json())
		.then(res => {
			if (res.success === true) {
				$('.close').click();
				// $('#editGroupChatModal').modal('hide');

				document.getElementById(id).querySelector('span').textContent = res.data.message;
				document.getElementById(id).querySelector('.fa-edit').setAttribute('data-msg', res.data.message);
				
				socket.emit('groupChatUpdated', { id: res.data._id, message: res.data.message });
			} else {
				alert(data.msg);
			}
		});
	});
}

socket.on('groupChatMessageUpdated', (data) => {
	document.getElementById(data.id).querySelector('span').textContent = data.message;
});