fetch('/profile/avatar')
    .then(response => {
        if (!response.ok) {
            throw new Error('Image acquisition error' + response.status);
        }
        return response.json();
    })
    .then(data => {

        const avatarUrl = data.avatarUrl;
        console.log('Url image received', avatarUrl);

        if (avatarUrl) {
            document.getElementById('user-avatar').src = avatarUrl;
        } else {
            document.getElementById('user-avatar').src = '/backend/uploads/user.jpg';
        }
    })
    .catch(error => {
        console.error('Error', error);
    });

document.addEventListener("DOMContentLoaded", function() {
    const avatarContainer = document.querySelector('.avatar-container');
    const logOutPopup = document.querySelector('#logout-popup');

    avatarContainer.addEventListener('click', function() {

        if (logOutPopup.style.display === 'block') {

            logOutPopup.style.display = 'none';
        } else {
            logOutPopup.style.display = 'block';
        }
    });
});

window.onload = function() {
    fetch('/profile/user-info')
        .then(response => response.json())
        .then(data => {
            document.getElementById('fullname').value = data.user_info.fullname;
            document.getElementById('email').value = data.user_info.email;

            const avatarUrl = data.user_info.avatar;

            if (avatarUrl) {
                document.getElementById('photo').src = avatarUrl;
            } else {
                document.getElementById('photo').src = '/backend/uploads/user.jpg';
            }

            if (avatarUrl) {
                fetch(avatarUrl)
                    .then(response => response.blob())
                    .then(blob => {

                        const file = new File([blob], 'avatar.jpg');

                        const fileList = new DataTransfer();
                        fileList.items.add(file);

                        document.getElementById('avatar').files = fileList.files;
                    })
                    .catch(error => console.error('Error loading avatar:', error));
            }
        })
        .catch(error => console.error('Error fetching user info:', error));

    document.getElementById('avatar').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('photo').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('deletePhotoButton').addEventListener('click', function() {

        document.getElementById('photo').src = '/backend/uploads/user.jpg';

        const photoUrl = document.getElementById('photo').src;
        fetch(photoUrl)
            .then(response => response.blob())
            .then(blob => {

                const file = new File([blob], 'deleted_avatar.jpg');

                const fileList = new DataTransfer();
                fileList.items.add(file);

                document.getElementById('avatar').files = fileList.files;
            })
            .catch(error => console.error('Error loading photo for deletion:', error));
    });
};

function logout() {
    fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            }
        })
        .catch(error => {
            console.error('Exit error', error);
        });
}

document.getElementById('logout-button').addEventListener('click', logout);




