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

// Add Members in Groups
const addMember = document.querySelectorAll('.addMember')
if (addMember) {
	Array.from(addMember).forEach(function (member) {
		member.addEventListener('click', function () {
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
								<input type="checkbox" `+ (isMemberOfGroup ? 'checked' : '') + ` name="members[]" value="`+users[i]['_id']+`"/>
							</td>
							<th>
								`+ users[i]['name'] + `
							</th>
						</tr>
						`;
					}
					document.querySelector('.addMembersInTable').innerHTML = html;
					$('.close').click();
				} else {
					alert(res.msg);
				}
			});
		});
	});
}

// Create Group Form Blade
const createGroupForm = document.getElementById('create-group-form');
if (createGroupForm) {
	createGroupForm.addEventListener('submit', function (event) {
		event.preventDefault();

		createGroupForm.style.display = 'none';
		document.getElementById('createGroupMessage').textContent = 'Group Creation Ongoing';

		const name = document.getElementById('name').value;
		const files = document.getElementById('file').files;
		const limit = document.getElementById('groupLimit').value;
		const room = 'room'+Date.now()+getRandomString();

		if (!name && !limit) {
			alert('Please input all fields');
			return;
		}

		if (files.length > 1) {
			alert('Please upload a single file only');
			return;
		}

		const obj = {};
		obj['files'] = [];
		obj['filename'] = [];

		Promise.all(getDataUrls(files)).then(fileDataUrls => {
			for (let i = 0; i < fileDataUrls.length; i++) {
				obj['files'].push(fileDataUrls[i]);
				obj['filename'].push(files[i].name);
			}

			fetch('/groups', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: name,
					limit: limit,
					room: room,
					filename: obj['filename'],
					files: obj['files']
				})
			})
				.then(res => res.json())
				.then(res => {
					if (res.success == true) {
						$('.close').click();
						document.getElementById('createGroupMessage').textContent = res.message;
						requestAnimationFrame(() => {
							setInterval(() => {
								const a = document.querySelector('#createGroupMessage')
								if(a) {
									a.remove();
								}
							}, 2000),
							setTimeout(() => { 
								location.replace('http://localhost:3000/groups');
							}, 3000);
						});
					} else {
						console.log(res.message);
					}
				});
		})
		.catch(error => {
			console.error('Error reading files:', error);
		});
	});
}

// Add Member Group form submit
const addMemberForm = document.querySelector('#add-member-form');
if (addMemberForm) {
	addMemberForm.addEventListener('submit', (event) => {
		event.preventDefault();

		const checkboxes = document.querySelectorAll('input[type="checkbox"][name="members[]"]');
    const checkedValues = [];
    checkboxes.forEach((checkbox) => {
        if(checkbox.checked) {
          checkedValues.push(checkbox.value);
        }
		});
		
		const limit = document.getElementById('limit').value - 1;
		const id = document.getElementById('group_id').value;
		
		fetch('/add-members', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				members: checkedValues,
				limit: limit,
				group_id: id
			})
		})
		.then(res => res.json())
		.then(res => {
			if (res.success === true) {
				$('.close').click();
				addMemberForm.reset();
				alert(res.msg);
			} else {
				document.getElementById('add-member-error').innerText = res.msg;
				setTimeout(() => { 
					document.getElementById('add-member-error').innerText = '';
				}, 1800);
			}
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
const updateChatGroupForm = document.getElementById('updateGroupForm');
if (updateChatGroupForm) { 
	updateChatGroupForm.addEventListener('submit', function (event) {
		event.preventDefault();

		const files = document.getElementById('file1').files;

		const obj = {};
		obj['id'] = document.getElementById('update_group_id').value;;
		obj['last_limit'] = document.getElementById('last_limit').value;
		obj['name'] = document.getElementById('group_name').value;
		obj['limit'] = document.getElementById('group_limit').value;
		obj['files'] = [];
		obj['filename'] = [];

		Promise.all(getDataUrls(files)).then(fileDataUrls => {
			for (let i = 0; i < fileDataUrls.length; i++) {
				obj['files'].push(fileDataUrls[i]);
				obj['filename'].push(files[i].name);
			}

			fetch('/update-group', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(
					obj
				),
			})
				.then(res => res.json())
				.then(res => {
					alert(res.msg);
					if (res.success === true) {
						location.reload();
					}
				});
		});
	});
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

// Delete Group Details Submit Blade
const deleteGroupDelete = document.querySelector('#deleteGroupForm');
if (deleteGroupDelete) {
	deleteGroupDelete.addEventListener('submit', function (event) {
		event.preventDefault();
		
		const id = document.getElementById('delete_group_id').value;
		
		fetch('/delete-group', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				id: id
			}),
		})
			.then(res => res.json())
			.then(res => {
				alert(res.msg);
				if (res.success === true) {
					location.reload();
				}
			});
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

// Group Chat Dialog Show Click
const groupList = document.querySelectorAll('.group-list');
if (groupList) {
	groupList.forEach(function (group) {
		group.addEventListener('click', function () {
			document.querySelector('.group-start-head').style.display = 'none';
			document.querySelector('.group-chat-section').style.display = 'block';
			global_group_id = this.getAttribute('data-id');

			document.getElementById('groupName').textContent = this.innerText;
			loadGroupChats();

			socket.emit('joinRoom', { id: global_group_id });
		});
	});
}

// Save Group Chat
const groupChatForm = document.getElementById('group-chat-form');
if (groupChatForm) {
	groupChatForm.addEventListener('submit', function (event) {
		event.preventDefault();

		const message = document.getElementById('group-message').value;
		const files = document.getElementById('file').files;
		groupChatForm.reset();

		if (!message && files.length === 0) {
			alert('Please provide a message or a file');
			return;
		}

		const obj = {};
		obj['sender_id'] =  sender_id;
		obj['group_id'] = global_group_id;
		obj['message'] = message;
		obj['files'] = [];
		obj['filename'] = [];

		const fileDataUrls = getDataUrls(files);
		Promise.all(fileDataUrls).then(fileDataUrls => {
			for (let i = 0; i < fileDataUrls.length; i++) {
				obj['files'].push(fileDataUrls[i]);
				obj['filename'].push(files[i].name);
			}

			socket.emit('saveGroupChat', obj, function (error, data) { 
				if (error) {
					console.log(error);
				}
			});
		});
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