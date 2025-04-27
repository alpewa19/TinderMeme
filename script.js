const API_BASE_URL = 'http://localhost:3000/api';
let currentUser = null;
let currentMeme = null;

const memeCard = document.getElementById('memeCard');
const memeImage = document.getElementById('memeImage');
const likeBtn = document.getElementById('likeBtn');
const dislikeBtn = document.getElementById('dislikeBtn');
const saveBtn = document.getElementById('saveBtn');
const likeOverlay = document.querySelector('.like-overlay');
const dislikeOverlay = document.querySelector('.dislike-overlay');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const favoritesGrid = document.getElementById('favoritesGrid');
const usersGrid = document.getElementById('usersGrid');
const totalSwipes = document.getElementById('totalSwipes');
const totalLikes = document.getElementById('totalLikes');
const totalSaves = document.getElementById('totalSaves');
const matchPopup = document.getElementById('matchPopup');
const matchesScreen = document.getElementById('matchesScreen');
const matchesBtn = document.getElementById('matchesBtn');
const matchesCount = document.getElementById('matchesCount');
const backToSwipeBtn = document.getElementById('backToSwipeBtn');
const keepSwipingBtn = document.getElementById('keepSwipingBtn');
const viewMatchBtn = document.getElementById('viewMatchBtn');
const profileBtn = document.getElementById('profileBtn');
const welcomeModal = document.getElementById('welcomeModal');
const userPreferencesForm = document.getElementById('userPreferencesForm');
const userProfileModal = document.getElementById('userProfileModal');
const closeUserProfileBtn = document.getElementById('closeUserProfileBtn');
const userProfileName = document.getElementById('userProfileName');
const userTotalSwipes = document.getElementById('userTotalSwipes');
const userTotalLikes = document.getElementById('userTotalLikes');
const userTotalSaves = document.getElementById('userTotalSaves');
const userFavoritesGrid = document.getElementById('userFavoritesGrid');
const likeProfileBtn = document.getElementById('likeProfileBtn');
const profileLikesCount = document.getElementById('profileLikesCount');
const topUsersGrid = document.getElementById('topUsersGrid');
let currentViewedUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${savedUserId}`);
            if (response.ok) {
                currentUser = await response.json();
                showMainContent();
                setupEventListeners();
            } else {
                showWelcomeModal();
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            showWelcomeModal();
        }
    } else {
        showWelcomeModal();
    }
});

function showWelcomeModal() {
    welcomeModal.style.display = 'flex';
}

function hideWelcomeModal() {
    welcomeModal.style.display = 'none';
}

function showMainContent() {
    document.querySelector('.container').style.display = 'block';
    loadRandomMeme();
}

userPreferencesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const selectedCategories = Array.from(document.querySelectorAll('input[name="categories"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedCategories.length === 0) {
        alert('Пожалуйста, выберите хотя бы одну категорию мемов');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                preferences: selectedCategories.reduce((acc, category) => {
                    acc[category] = 1;
                    return acc;
                }, {})
            })
        });

        if (response.ok) {
            currentUser = await response.json();
            localStorage.setItem('userId', currentUser._id);
            hideWelcomeModal();
            showMainContent();
            setupEventListeners();
        } else {
            throw new Error('Failed to create user');
        }
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Произошла ошибка при создании пользователя');
    }
});

async function loadRandomMeme() {
    try {
        if (!currentUser) {
            console.error('No current user');
            return;
        }

        console.log('Loading random meme...');
        const response = await fetch(`${API_BASE_URL}/memes/random?userId=${currentUser._id}`);
        
        if (!response.ok) {
            throw new Error('Failed to load meme');
        }
        
        currentMeme = await response.json();
        console.log('Meme loaded:', currentMeme);
        
        memeImage.src = currentMeme.url;
        memeImage.alt = currentMeme.title;
        memeCard.querySelector('div h3').textContent = currentMeme.title;
        memeCard.querySelector('div p').innerHTML = `Posted by <span class="font-medium">${currentMeme.author}</span>`;
        memeCard.dataset.memeId = currentMeme._id;
        
        likeBtn.disabled = false;
        dislikeBtn.disabled = false;
        saveBtn.disabled = false;
    } catch (error) {
        console.error('Error loading meme:', error);
        memeImage.src = "placeholder.jpg";
        memeImage.alt = "Error loading meme";
        memeCard.querySelector('div p').textContent = "Error loading meme. Please try again later.";
        likeBtn.disabled = true;
        dislikeBtn.disabled = true;
        saveBtn.disabled = true;
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    if (likeBtn) likeBtn.addEventListener('click', () => handleLike());
    if (dislikeBtn) dislikeBtn.addEventListener('click', () => handleDislike());
    if (saveBtn) saveBtn.addEventListener('click', () => handleSave());

    if (tabButtons) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
    }

    if (matchesBtn) {
        matchesBtn.addEventListener('click', () => {
            if (matchesScreen) matchesScreen.classList.remove('hidden');
        });
    }

    if (backToSwipeBtn) {
        backToSwipeBtn.addEventListener('click', () => {
            if (matchesScreen) matchesScreen.classList.add('hidden');
        });
    }

    if (keepSwipingBtn) {
        keepSwipingBtn.addEventListener('click', () => {
            if (matchPopup) matchPopup.classList.add('hidden');
        });
    }

    if (viewMatchBtn) {
        viewMatchBtn.addEventListener('click', () => {
            if (matchPopup) matchPopup.classList.add('hidden');
            if (matchesScreen) matchesScreen.classList.remove('hidden');
        });
    }

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            switchTab('profile');
        });
    }

    let startX, moveX;
    memeCard.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    memeCard.addEventListener('touchmove', (e) => {
        moveX = e.touches[0].clientX;
        const diff = moveX - startX;
        memeCard.style.transform = `translateX(${diff}px) rotate(${diff/10}deg)`;
        
        if (diff > 50) {
            likeOverlay.classList.add('show-overlay');
            dislikeOverlay.classList.remove('show-overlay');
        } else if (diff < -50) {
            dislikeOverlay.classList.add('show-overlay');
            likeOverlay.classList.remove('show-overlay');
        } else {
            likeOverlay.classList.remove('show-overlay');
            dislikeOverlay.classList.remove('show-overlay');
        }
    });

    memeCard.addEventListener('touchend', (e) => {
        const diff = moveX - startX;
        if (diff > 100) {
            handleLike();
        } else if (diff < -100) {
            handleDislike();
        } else {
            memeCard.style.transform = '';
        }
        likeOverlay.classList.remove('show-overlay');
        dislikeOverlay.classList.remove('show-overlay');
    });
}

async function handleLike() {
    if (!currentMeme || !currentUser) {
        console.error('No current meme or user');
        return;
    }
    
    likeOverlay.classList.add('show-overlay');
    memeCard.classList.add('swipe-right');
    
    try {
        console.log('Handling like for meme:', currentMeme._id);
        const response = await fetch(`${API_BASE_URL}/users/${currentUser._id}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memeId: currentMeme._id,
                action: 'like'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to process like');
        }
        
        setTimeout(async () => {
            await loadRandomMeme();
            memeCard.classList.remove('swipe-right');
            likeOverlay.classList.remove('show-overlay');
            await updateStats();
            await renderFavorites();
        }, 300);
    } catch (error) {
        console.error('Error handling like:', error);
        memeCard.classList.remove('swipe-right');
        likeOverlay.classList.remove('show-overlay');
    }
}

async function handleDislike() {
    if (!currentMeme || !currentUser) {
        console.error('No current meme or user');
        return;
    }

    try {
        memeCard.classList.add('swipe-left');
        dislikeOverlay.classList.add('show-overlay');
        
        const response = await fetch(`${API_BASE_URL}/users/${currentUser._id}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memeId: currentMeme._id,
                action: 'dislike'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to process dislike');
        }
        
        setTimeout(async () => {
            await loadRandomMeme();
            memeCard.classList.remove('swipe-left');
            dislikeOverlay.classList.remove('show-overlay');
            await updateStats();
        }, 300);
    } catch (error) {
        console.error('Error handling dislike:', error);
        memeCard.classList.remove('swipe-left');
        dislikeOverlay.classList.remove('show-overlay');
    }
}

async function handleSave() {
    if (!currentMeme || !currentUser) {
        console.error('No current meme or user');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser._id}/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                memeId: currentMeme._id,
                action: 'save'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to process save');
        }
        
        await updateStats();
        await renderFavorites();
    } catch (error) {
        console.error('Error handling save:', error);
    }
}

async function switchTab(tabId) {
    tabContents.forEach(content => {
        content.classList.remove('active');
        content.classList.add('hidden');
    });
    
    document.getElementById(tabId).classList.remove('hidden');
    document.getElementById(tabId).classList.add('active');
    
    tabButtons.forEach(button => {
        button.classList.remove('border-pink-500', 'text-pink-600');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('border-pink-500', 'text-pink-600');
        }
    });
    
    if (tabId === 'favorites') {
        await renderFavorites();
    } else if (tabId === 'users') {
        await renderUsers();
    } else if (tabId === 'swipe') {
        await loadRandomMeme();
    }
}

async function updateStats() {
    if (!currentUser) {
        console.error('No current user');
        return;
    }
    
    try {
        console.log('Updating stats for user:', currentUser._id);
        const response = await fetch(`${API_BASE_URL}/users/${currentUser._id}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch user stats');
        }
        
        const user = await response.json();
        
        totalSwipes.textContent = user.totalSwipes;
        totalLikes.textContent = user.totalLikes;
        totalSaves.textContent = user.totalSaves;
        
        if (user.matches && user.matches.length > 0) {
            matchesCount.textContent = user.matches.length;
            matchesCount.classList.remove('hidden');
        } else {
            matchesCount.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

async function renderFavorites() {
    if (!currentUser) {
        console.error('No current user');
        return;
    }
    
    try {
        console.log('Rendering favorites for user:', currentUser._id);
        const response = await fetch(`${API_BASE_URL}/users/${currentUser._id}/favorites`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch favorites');
        }
        
        const favorites = await response.json();
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="text-center py-10 text-gray-500 col-span-3">
                    <i class="fas fa-heart text-4xl mb-2"></i>
                    <p>No favorites yet. Start swiping!</p>
                </div>
            `;
            return;
        }
        
        favoritesGrid.innerHTML = favorites.map(meme => `
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <img src="${meme.url}" alt="${meme.title}" class="w-full h-48 object-cover">
                <div class="p-3">
                    <h3 class="font-semibold">${meme.title}</h3>
                    <p class="text-sm text-gray-600">by ${meme.author}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error rendering favorites:', error);
        favoritesGrid.innerHTML = `
            <div class="text-center py-10 text-gray-500 col-span-3">
                <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                <p>Error loading favorites. Please try again later.</p>
            </div>
        `;
    }
}

async function renderUsers() {
    try {
        console.log('Loading users...');
        const response = await fetch(`${API_BASE_URL}/users`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        
        if (users.length === 0) {
            usersGrid.innerHTML = `
                <div class="text-center py-10 text-gray-500 col-span-3">
                    <i class="fas fa-users text-4xl mb-2"></i>
                    <p>No users found</p>
                </div>
            `;
            return;
        }
        
        usersGrid.innerHTML = users.map(user => `
            <div class="bg-white rounded-xl shadow-md overflow-hidden">
                <div class="p-4">
                    <h3 class="font-semibold text-lg">${user.username}</h3>
                    <div class="grid grid-cols-3 gap-2 mt-2 text-sm">
                        <div class="text-center">
                            <div class="font-bold">${user.totalSwipes}</div>
                            <div class="text-gray-600">Swipes</div>
                        </div>
                        <div class="text-center">
                            <div class="font-bold">${user.totalLikes}</div>
                            <div class="text-gray-600">Likes</div>
                        </div>
                        <div class="text-center">
                            <div class="font-bold">${user.totalSaves}</div>
                            <div class="text-gray-600">Saves</div>
                        </div>
                    </div>
                </div>
                <div class="p-4 border-t">
                    <h4 class="font-medium mb-2">Favorite Memes</h4>
                    <div class="grid grid-cols-2 gap-2">
                        ${user.favorites.slice(0, 4).map(meme => `
                            <div class="relative">
                                <img src="${meme.url}" alt="${meme.title}" class="w-full h-24 object-cover rounded">
                                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                                    ${meme.title}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ${user.favorites.length > 4 ? `
                        <div class="text-center mt-2">
                            <span class="text-sm text-gray-500">+${user.favorites.length - 4} more</span>
                        </div>
                    ` : ''}
                    <button class="w-full mt-4 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition view-profile-btn" data-user-id="${user._id}">
                        View Profile
                    </button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.view-profile-btn').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-user-id');
                showUserProfile(userId);
            });
        });
    } catch (error) {
        console.error('Error rendering users:', error);
        usersGrid.innerHTML = `
            <div class="text-center py-10 text-gray-500 col-span-3">
                <i class="fas fa-exclamation-circle text-4xl mb-2"></i>
                <p>Error loading users. Please try again later.</p>
            </div>
        `;
    }
}

function showFullScreenMeme(meme) {
    const modal = document.getElementById('fullScreenMemeModal');
    const image = document.getElementById('fullScreenMemeImage');
    const title = document.getElementById('fullScreenMemeTitle');
    const author = document.getElementById('fullScreenMemeAuthor');
    
    image.src = meme.url;
    image.alt = meme.title;
    title.textContent = meme.title;
    author.textContent = `by ${meme.author || 'Unknown'}`;
    
    modal.classList.remove('hidden');
    
    document.getElementById('closeFullScreenMemeBtn').onclick = () => {
        modal.classList.add('hidden');
    };
    
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            modal.classList.add('hidden');
            document.removeEventListener('keydown', handleEscape);
        }
    });
}

async function showUserProfile(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to load user profile');
        }
        const user = await response.json();
        
        userProfileName.textContent = user.username;
        userTotalSwipes.textContent = user.totalSwipes || 0;
        userTotalLikes.textContent = user.totalLikes || 0;
        userTotalSaves.textContent = user.totalSaves || 0;
        
        if (user.favorites && user.favorites.length > 0) {
            userFavoritesGrid.innerHTML = `
                <div class="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    ${user.favorites.map(meme => `
                        <div class="relative group cursor-pointer" onclick="showFullScreenMeme(${JSON.stringify(meme).replace(/"/g, '&quot;')})">
                            <img src="${meme.url}" alt="${meme.title}" 
                                class="w-full h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105">
                            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                                <p class="font-medium">${meme.title}</p>
                                <p class="text-gray-300 text-xs">by ${meme.author || 'Unknown'}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `;
            document.head.appendChild(style);
        } else {
            userFavoritesGrid.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-image text-4xl mb-2"></i>
                    <p>Нет сохраненных мемов</p>
                </div>
            `;
        }
        
        userProfileModal.classList.remove('hidden');
        userProfileModal.classList.add('opacity-100');
        
        closeUserProfileBtn.onclick = () => {
            userProfileModal.classList.add('hidden');
            userProfileModal.classList.remove('opacity-100');
        };
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        alert('Не удалось загрузить профиль пользователя');
    }
}

function setupProfileEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.view-profile-btn')) {
            const userId = e.target.closest('.view-profile-btn').getAttribute('data-user-id');
            if (userId) {
                showUserProfile(userId);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupProfileEventListeners();
});

document.addEventListener('DOMContentLoaded', init);

document.getElementById('generateMemeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const prompt = document.getElementById('memePrompt').value;
    const category = document.getElementById('memeCategory').value;
    
    if (!prompt || !category) {
        alert('Пожалуйста, введите идею мема и выберите категорию');
        return;
    }
    
    const statusDiv = document.getElementById('generationStatus');
    const previewDiv = document.getElementById('memePreview');
    const memeImage = document.getElementById('generatedMemeImage');
    const memeTitle = document.getElementById('generatedMemeTitle');
    
    try {
        statusDiv.classList.remove('hidden');
        previewDiv.classList.add('hidden');
        
        const response = await fetch(`${API_BASE_URL}/memes/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, category })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.details || 'Ошибка генерации мема');
        }
        
        if (data.success && data.meme) {
            memeImage.src = data.meme.url;
            memeImage.alt = data.meme.title;
            memeTitle.textContent = data.meme.title;
            
            statusDiv.classList.add('hidden');
            previewDiv.classList.remove('hidden');
            
            document.getElementById('memePrompt').value = '';
            document.getElementById('memeCategory').value = '';
            
            alert('Мем успешно сгенерирован!');
        } else {
            throw new Error('Не удалось получить сгенерированный мем');
        }
    } catch (error) {
        console.error('Error generating meme:', error);
        alert(`Ошибка: ${error.message}`);
        statusDiv.classList.add('hidden');
    }
});

document.getElementById('uploadMemeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadPreview = document.getElementById('uploadPreview');
    const uploadedMemeImage = document.getElementById('uploadedMemeImage');
    const uploadedMemeTitle = document.getElementById('uploadedMemeTitle');
    
    const formData = {
        url: document.getElementById('memeUrl').value,
        title: document.getElementById('memeTitle').value,
        author: document.getElementById('memeAuthor').value,
        category: document.getElementById('uploadCategory').value
    };

    try {
        uploadStatus.classList.remove('hidden');
        uploadPreview.classList.add('hidden');

        const response = await fetch(`${API_BASE_URL}/memes/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to upload meme');
        }

        const result = await response.json();
        
        uploadStatus.classList.add('hidden');
        uploadPreview.classList.remove('hidden');
        
        uploadedMemeImage.src = result.meme.url;
        uploadedMemeImage.alt = result.meme.title;
        uploadedMemeTitle.textContent = result.meme.title;
        
        e.target.reset();
        
        alert('Meme uploaded successfully!');
        
    } catch (error) {
        console.error('Error uploading meme:', error);
        uploadStatus.classList.add('hidden');
        alert('Failed to upload meme. Please try again.');
    }
}); 