const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = 'mongodb://localhost:27017/memematch';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const memeSchema = new mongoose.Schema({
    url: String,
    title: String,
    author: String,
    category: {
        type: String,
        enum: ['blackHumor', 'racist', 'programmer', 'work', 'dota', 'student'],
        required: true
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    saves: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
    username: String,
    totalSwipes: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalSaves: { type: Number, default: 0 },
    profileLikes: { type: Number, default: 0 },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meme' }],
    matches: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        matchPercentage: Number
    }],
    preferences: {
        blackHumor: { type: Number, default: 0 },
        racist: { type: Number, default: 0 },
        programmer: { type: Number, default: 0 },
        work: { type: Number, default: 0 },
        dota: { type: Number, default: 0 },
        student: { type: Number, default: 0 }
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Meme = mongoose.model('Meme', memeSchema);
const User = mongoose.model('User', userSchema);

async function initializeData() {
    try {
        console.log('Checking if database needs initialization...');
        const memeCount = await Meme.countDocuments();
        console.log('Current meme count:', memeCount);
        
        if (memeCount === 0) {
            console.log('No memes found, initializing database...');
            const sampleMemes = [
                {
                    url: "https://i.pinimg.com/736x/f7/b8/08/f7b8086cf2dc3a447a5076e23b83e9b0.jpg",
                    title: "Black Humor Meme 1",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxwp6N2ov2kclZ2SJdO1EWv-XdC0sJ0qWVRg&s",
                    title: "Black Humor Meme 2",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://cdn.trinixy.ru/pics6/20220817/230535_1_trinixy_ru.jpg",
                    title: "Black Humor Meme 3",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQkths9Ge9oUygt2PYI8rWojlyGuTnrPYsqA&s",
                    title: "Black Humor Meme 4",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://cs19.pikabu.ru/s/2025/04/23/17/gj254zab.jpg",
                    title: "Black Humor Meme 5",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXjd2RqZTs9d2nhNeCMQ52g8qCUlivZ0TFSQ&s",
                    title: "Black Humor Meme 6",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8TlcaqNbU0iQI2e8GB0kEJ8Uh7Zc8JdiAcQ&s",
                    title: "Black Humor Meme 7",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://www.mam4.ru/resize/710x-/https/www.mam4.ru/media/upload/user/10183/40/img7225.jpg?h=xVP_WxJozDNb5_mrPQLwKA",
                    title: "Black Humor Meme 8",
                    author: "Anonymous",
                    category: "blackHumor"
                },
                {
                    url: "https://cs15.pikabu.ru/post_img/2025/02/07/7/1738923005174685698.jpg",
                    title: "Racist Meme 1",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://img08.rl0.ru/afisha/e750x-i/daily.afisha.ru/uploads/images/6/9c/69caa9eeef38d831c5b525b2c215ff85.jpeg",
                    title: "Racist Meme 2",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://cs13.pikabu.ru/post_img/2024/02/01/9/1706801753130164744.jpg",
                    title: "Racist Meme 3",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://memoteka.com/images/4/46/Поваррасист3.jpeg",
                    title: "Racist Meme 4",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://cs15.pikabu.ru/post_img/2025/02/15/0/1739568773162592511.jpg",
                    title: "Racist Meme 5",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://www.cdn.memify.ru/media/GCjahEivDOGixszXtJYLDw/20211125/_CYKAQybXvs.jpg",
                    title: "Racist Meme 6",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://cdn.idaprikol.ru/images/b8289b55e93ba27e00104c02ccab98894ce27efcd40c66d75612b07c6088c1c4_1.jpg",
                    title: "Racist Meme 7",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://cs15.pikabu.ru/post_img/2025/03/06/10/1741279923179119884.jpg",
                    title: "Racist Meme 8",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://www.anekdot.ru/i/caricatures/normal/21/10/12/1634061213.jpg",
                    title: "Racist Meme 9",
                    author: "Anonymous",
                    category: "racist"
                },
                {
                    url: "https://thecode.media/wp-content/uploads/2024/12/image11-4.png",
                    title: "Programmer Meme 1",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://thecode.media/wp-content/uploads/2024/12/image5-9.png",
                    title: "Programmer Meme 2",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://skillbox.ru/upload/setka_images/14055326052022_0ed1686442ac630326a48ddcef43684fa02b904b.jpg",
                    title: "Programmer Meme 3",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://24gadget.ru/uploads/posts/2021-11/1636621455_bez-imeni-1.png",
                    title: "Programmer Meme 4",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://avatars.dzeninfra.ru/get-zen_doc/28532/pub_5dc24e4dec575b00b1543152_5dc2559ea06eaf00ae1ab9ec/scale_1200",
                    title: "Programmer Meme 5",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://cs14.pikabu.ru/post_img/big/2024/02/05/8/1707138397174330324.png",
                    title: "Programmer Meme 6",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://thecode.media/wp-content/uploads/2024/12/image6-11-724x1024.png",
                    title: "Programmer Meme 7",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://preview.redd.it/мемы-для-программистов-не-заставили-долго-ждать-v0-g57k6567sb2e1.png?auto=webp&s=e100704f199670d2cddbf75f799c8ba5c1168a7b",
                    title: "Programmer Meme 8",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://obj.altapress.ru/picture/822307/936x.webp",
                    title: "Programmer Meme 9",
                    author: "Anonymous",
                    category: "programmer"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ47H6kZYhkM_yl_K-s1igDushzjieUMD3iA&s",
                    title: "Work Meme 1",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvjI31ED4CkrqL6W3zqrKFglDZHiDYvRf_kA&s",
                    title: "Work Meme 2",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://cs15.pikabu.ru/post_img/big/2024/09/24/7/1727177025166255797.jpg",
                    title: "Work Meme 3",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_672d033f90ac1d317fab5e54_672e56694a6dc7055cf9582a/scale_1200",
                    title: "Work Meme 4",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://st.peopletalk.ru/wp-content/uploads/2020/07/03f09b2b91441786555b121533249030.jpg",
                    title: "Work Meme 5",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://opis-cdn.tinkoffjournal.ru/ip/rlgxMwlw6NBS9uoOSYq3i-Ep_59Y63ZscRRzXEAMcgA/h:790/w:890/aHR0cHM6Ly9vcGlzLWNkbi50aW5rb2Zmam91cm5hbC5ydS9zb2NpYWwvY29tbWVudHMvYzIyNmZlMTQuZjllZmVlMTdfM3Z1bWZoLmpwZWc",
                    title: "Work Meme 6",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaf222wFBAh-W3Bxsnn2ACiOIOLKPub-JlfQ&s",
                    title: "Work Meme 7",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://www.anekdot.ru/i/caricatures/normal/24/11/17/mem-pro-rabotu_44941.jpg",
                    title: "Work Meme 8",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://img-fotki.yandex.ru/get/224193/8882555.44/0_182619_fd58eddd_XL.jpg",
                    title: "Work Meme 9",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://hr-portal.ru/files/34e72941-cd9f-4620-ab36-ca53c6b263bd.jpg",
                    title: "Work Meme 10",
                    author: "Anonymous",
                    category: "work"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXhodB0uRb9uNar_jAzZvWmX6MFD5qieoX3Q&s",
                    title: "Dota Meme 1",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://img.championat.com/i/article/97/80/1490709780.jpg",
                    title: "Dota Meme 2",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://img.championat.com/i/article/97/85/1490709785.jpg",
                    title: "Dota Meme 3",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://avatars.dzeninfra.ru/get-zen_doc/1657335/pub_5fc34ea139eab6574dff37f8_5fc34efed57ee92752ad92c4/scale_1200",
                    title: "Dota Meme 4",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvulsRFUZ9s9SSGN_FZN7Z39AXHoJnuZmXAA&s",
                    title: "Dota Meme 5",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://cs12.pikabu.ru/post_img/2021/03/24/9/1616597283188547452.png",
                    title: "Dota Meme 6",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://i.pinimg.com/1200x/01/ee/11/01ee1152f9e5ce6b893bb4cad6fdbc52.jpg",
                    title: "Dota Meme 7",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRUlUDJIYywoEzwOPMLIywC0X6DSAOjpZbxg&s",
                    title: "Dota Meme 8",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf8EZA3ySaczU50yNoJsWtjAb7f6EAkcResg&s",
                    title: "Dota Meme 9",
                    author: "Anonymous",
                    category: "dota"
                },
                {
                    url: "https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_66d186f86e333d467886c327_66d1874c9bffdb0602b5d4d0/scale_1200",
                    title: "Student Meme 1",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_DLkI6XDzdibkymQDJmB1nwoekhtq4S5Xdw&s",
                    title: "Student Meme 2",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://www.anekdot.ru/i/caricatures/normal/20/1/25/pro-studentov_84798.jpg",
                    title: "Student Meme 3",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://cs13.pikabu.ru/post_img/big/2023/09/16/10/1694880250278919537.png",
                    title: "Student Meme 4",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCVl0rlQo08bnwFYmySlfdnlCBQBcjAChB3w&s",
                    title: "Student Meme 5",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://avatars.dzeninfra.ru/get-zen_doc/9429668/pub_646d0600467110279c516663_646d074c960480635c14e6d9/scale_1200",
                    title: "Student Meme 6",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://sun9-71.userapi.com/impg/v-b1lMaq5jSet8lAXK5ddOV0Z5-fqEJpEGVWBw/6nhxiPhrL54.jpg?size=590x604&quality=95&sign=25e83d567fd64d3f910c94fd5a75004d&type=album",
                    title: "Student Meme 7",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://pbs.twimg.com/media/E2aWjrQX0AEHvRf.jpg",
                    title: "Student Meme 8",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://st.peopletalk.ru/wp-content/uploads/2022/08/0iulrrdu5c0.jpeg",
                    title: "Student Meme 9",
                    author: "Anonymous",
                    category: "student"
                },
                {
                    url: "https://www.anekdot.ru/i/caricatures/normal/21/3/1/1614603733.jpg",
                    title: "Student Meme 10",
                    author: "Anonymous",
                    category: "student"
                }
            ];
            
            console.log('Inserting sample memes...');
            const result = await Meme.insertMany(sampleMemes);
            console.log('Inserted memes:', result.length);
            
            console.log('Creating test user...');
            const testUser = new User({
                username: 'TestUser',
                preferences: {
                    blackHumor: 0,
                    racist: 0,
                    programmer: 0,
                    work: 0,
                    dota: 0,
                    student: 0
                }
            });
            await testUser.save();
            console.log('Test user created:', testUser._id);
        } else {
            console.log('Database already initialized');
        }
    } catch (error) {
        console.error('Error initializing data:', error);
        console.error('Error stack:', error.stack);
    }
}

app.post('/api/users', async (req, res) => {
    try {
        const { username, preferences } = req.body;
        
        if (!username || !preferences) {
            return res.status(400).json({ error: 'Username and preferences are required' });
        }

        const user = new User({
            username,
            preferences: {
                blackHumor: preferences.blackHumor || 0,
                racist: preferences.racist || 0,
                programmer: preferences.programmer || 0,
                work: preferences.work || 0,
                dota: preferences.dota || 0,
                student: preferences.student || 0
            }
        });

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/memes/random', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const preferredCategories = Object.entries(user.preferences)
            .filter(([_, value]) => value > 0)
            .map(([category]) => category);

        if (preferredCategories.length === 0) {
            return res.status(400).json({ error: 'User has no preferred categories' });
        }

        const count = await Meme.countDocuments({ category: { $in: preferredCategories } });
        if (count === 0) {
            return res.status(404).json({ error: 'No memes available in preferred categories' });
        }

        const randomIndex = Math.floor(Math.random() * count);
        const meme = await Meme.findOne({ category: { $in: preferredCategories } }).skip(randomIndex);

        res.json(meme);
    } catch (error) {
        console.error('Error getting random meme:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users/:userId/action', async (req, res) => {
    try {
        console.log('Received action request:', { userId: req.params.userId, body: req.body });
        
        const { userId } = req.params;
        const { memeId, action } = req.body;
        
        if (!memeId || !action) {
            console.log('Missing memeId or action');
            return res.status(400).json({ error: 'Missing memeId or action' });
        }
        
        if (!['like', 'dislike', 'save'].includes(action)) {
            console.log('Invalid action:', action);
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        console.log('Looking for user:', userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('Looking for meme:', memeId);
        const meme = await Meme.findById(memeId);
        if (!meme) {
            console.log('Meme not found:', memeId);
            return res.status(404).json({ error: 'Meme not found' });
        }
        
        console.log('Updating stats for action:', action);
        user.totalSwipes++;
        
        if (action === 'like') {
            user.totalLikes++;
            meme.likes++;
            if (!user.favorites.includes(memeId)) {
                user.favorites.push(memeId);
            }
            user.preferences[meme.category] = (user.preferences[meme.category] || 0) + 1;
        } else if (action === 'dislike') {
            meme.dislikes++;
        } else if (action === 'save') {
            user.totalSaves++;
            meme.saves++;
            if (!user.favorites.includes(memeId)) {
                user.favorites.push(memeId);
            }
        }
        
        await user.save();
        await meme.save();
        
        if (action === 'like' && user.totalLikes % 10 === 0) {
            const matches = await findMatches(user);
            user.matches = matches;
            await user.save();
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error processing user action:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('favorites')
            .populate('matches.userId');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/users/:userId/favorites', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const favorites = await Meme.find({ _id: { $in: user.favorites } });
        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username totalSwipes totalLikes totalSaves favorites')
            .populate('favorites');
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users/:userId/like', async (req, res) => {
    try {
        const { userId } = req.params;
        const { action } = req.body;
        
        if (!action || !['like', 'unlike'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const likerId = req.headers['x-user-id'];
        if (!likerId) {
            return res.status(400).json({ error: 'Liker ID is required' });
        }

        const hasLiked = user.likedBy?.includes(likerId);

        if (action === 'like') {
            if (hasLiked) {
                return res.status(400).json({ error: 'You have already liked this profile' });
            }
            user.profileLikes = (user.profileLikes || 0) + 1;
            user.likedBy = user.likedBy || [];
            user.likedBy.push(likerId);
        } else if (action === 'unlike') {
            if (!hasLiked) {
                return res.status(400).json({ error: 'You have not liked this profile' });
            }
            user.profileLikes = Math.max(0, (user.profileLikes || 0) - 1);
            user.likedBy = user.likedBy.filter(id => id !== likerId);
        }

        await user.save();
        res.json({ 
            profileLikes: user.profileLikes,
            hasLiked: action === 'like'
        });
    } catch (error) {
        console.error('Error processing profile like:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function findMatches(user) {
    const users = await User.find({
        _id: { $ne: user._id },
        'matches.userId': { $ne: user._id }
    });
    
    const matches = [];
    for (const otherUser of users) {
        const matchPercentage = calculateMatchPercentage(user, otherUser);
        if (matchPercentage >= 70) {
            matches.push({
                userId: otherUser._id,
                matchPercentage
            });
        }
    }
    
    return matches;
}

function calculateMatchPercentage(user1, user2) {
    const preferences1 = user1.preferences;
    const preferences2 = user2.preferences;
    
    const blackHumorDiff = Math.abs(preferences1.blackHumor - preferences2.blackHumor);
    const racistDiff = Math.abs(preferences1.racist - preferences2.racist);
    const programmerDiff = Math.abs(preferences1.programmer - preferences2.programmer);
    const workDiff = Math.abs(preferences1.work - preferences2.work);
    const dotaDiff = Math.abs(preferences1.dota - preferences2.dota);
    const studentDiff = Math.abs(preferences1.student - preferences2.student);
    
    const totalDiff = (blackHumorDiff + racistDiff + programmerDiff + workDiff + dotaDiff + studentDiff) / 6;
    return Math.max(0, 100 - totalDiff);
}

app.post('/api/memes', async (req, res) => {
    try {
        const { url, title, author, category } = req.body;
        
        if (!url || !title || !author || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const meme = new Meme({
            url,
            title,
            author,
            category
        });
        
        await meme.save();
        res.json(meme);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/memes/generate', async (req, res) => {
    try {
        const { prompt, category } = req.body;
        
        console.log('Received meme generation request:', { prompt, category });
        
        if (!prompt || !category) {
            return res.status(400).json({ error: 'Prompt and category are required' });
        }

        console.log('Generating image with Hugging Face...');
        const imagePrompt = `funny cartoon meme: ${prompt}`;
        console.log('Using prompt:', imagePrompt);

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
            {
                inputs: imagePrompt,
                options: {
                    wait_for_model: true
                }
            },
            {
                headers: {
                    'Authorization': 'Bearer hf_example_token', // Replace with your token
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        console.log('Image generated successfully');
        
        const base64Image = Buffer.from(response.data).toString('base64');
        const imageUrl = `data:image/png;base64,${base64Image}`;
        
        const meme = new Meme({
            url: imageUrl,
            title: prompt,
            author: "AI Generated",
            category: category,
            likes: 0,
            dislikes: 0,
            saves: 0
        });

        await meme.save();
        console.log('Meme saved successfully');

        res.json({
            success: true,
            meme: {
                _id: meme._id,
                title: meme.title,
                url: meme.url,
                category: meme.category
            }
        });
    } catch (error) {
        console.error('Error in meme generation:', error);
        res.status(500).json({ 
            error: 'Failed to generate meme',
            details: error.message
        });
    }
});

app.post('/api/memes/upload', async (req, res) => {
    try {
        const { url, title, author, category } = req.body;
        
        console.log('Received meme upload request:', { url, title, author, category });
        
        if (!url) {
            console.log('Missing URL');
            return res.status(400).json({ error: 'URL is required' });
        }
        if (!title) {
            console.log('Missing title');
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!author) {
            console.log('Missing author');
            return res.status(400).json({ error: 'Author is required' });
        }
        if (!category) {
            console.log('Missing category');
            return res.status(400).json({ error: 'Category is required' });
        }

        try {
            new URL(url);
            console.log('URL format is valid');
        } catch (err) {
            console.log('Invalid URL format:', err.message);
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        const validCategories = ['blackHumor', 'racist', 'programmer', 'work', 'dota', 'student'];
        if (!validCategories.includes(category)) {
            console.log('Invalid category:', category);
            return res.status(400).json({ error: 'Invalid category' });
        }

        console.log('Creating new meme in database...');
        const meme = new Meme({
            url,
            title,
            author,
            category,
            likes: 0,
            dislikes: 0,
            saves: 0
        });

        await meme.save();
        console.log('Meme saved successfully:', meme._id);

        res.json({
            success: true,
            meme: {
                _id: meme._id,
                title: meme.title,
                url: meme.url,
                category: meme.category
            }
        });
    } catch (error) {
        console.error('Error in meme upload:', error);
        res.status(500).json({ 
            error: 'Failed to upload meme',
            details: error.message
        });
    }
});

initializeData()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error starting server:', error);
    }); 