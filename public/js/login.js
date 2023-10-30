const newUser = document.getElementById('new-user-form');
if (newUser) {
	newUser.addEventListener('submit', function (event) { 
		event.preventDefault();
		
		document.getElementById('new-user-form').style.display = 'none';
		document.getElementById('message').textContent = 'Registration Ongoing';

		const name = document.getElementById('name').value;
		const email = document.getElementById('email').value;
		const files = document.getElementById('file').files;
		const password = document.getElementById('password').value;

		if (!name && !email && !password) {
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

			fetch('/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: name,
					email: email,
					password: password,
					filename: obj['filename'],
					files: obj['files']
				})
			})
				.then(res => res.json())
				.then(res => {
					if (res.success == true) {
						// document.getElementById('name').value = null;
						// document.getElementById('email').value = null;
						// document.getElementById('password').value = null;
						// document.getElementById('file').value = null;
						document.getElementById('new-user-form').style.display = 'none';
						document.getElementById('message').textContent = res.message;
						requestAnimationFrame(() => {
							setTimeout(() => { 
								location.replace('http://localhost:3000/');
							}, 5000);
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

// Login Email Value Change
const existingUserEmail = document.getElementById('email');
if (existingUserEmail) { 
	existingUserEmail.addEventListener('input', function () {
		const a = document.getElementById('messageError');
		if (a) {
			a.textContent = '';
		}
	});
}

// Login Email Value Change
const existingUserPassword = document.getElementById('password');
if (existingUserPassword) { 
	existingUserPassword.addEventListener('input', function () {
		const a = document.getElementById('messageError');
		if (a) {
			a.textContent = '';
		}
	});
}

// Login Submit
const existingUser = document.getElementById('user-login');
if (existingUser) { 
	existingUser.addEventListener('submit', function (event) {
		event.preventDefault();

		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;

		console.log(email, password);

		fetch('/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: email,
				password: password
			})
		})
			.then(res => res.json())
			.then(res => {
				if (res.success == true) {
					document.getElementById('user-login').style.display = 'none';
					location.replace('http://localhost:3000/dashboard');
				} else {
					document.getElementById('messageError').textContent = res.message;
				}
			});
	});
}