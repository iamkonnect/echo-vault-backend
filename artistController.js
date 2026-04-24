const prisma = require('./src/utils/prisma');

exports.renderDashboard = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized');
    try {
        const songCount = await prisma.song.count({ where: { artistId: req.user.id } });
        const shortCount = await prisma.short.count({ where: { artistId: req.user.id } });
        
        // Fetching stats for the dashboard view
        const stats = {
            streams: 5000, // Placeholder for aggregation logic
            monthlyListeners: 120,
            contentCount: songCount + shortCount
        };

        res.render('artist-dashboard', { user: req.user, stats });
    } catch (error) {
        console.error('Error rendering Artist Dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.renderMyMusicPage = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized'); // Ensure user is logged in
    try {
        const songs = await prisma.song.findMany({
            where: { artistId: req.user.id }
        });
        const videos = await prisma.short.findMany({
            where: { artistId: req.user.id }
        });

        res.render('my-music', { songs, videos });
    } catch (error) {
        console.error('Error rendering My Music page:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.renderShortsInsightsPage = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized'); // Ensure user is logged in
    try {
        const shorts = await prisma.short.findMany({
            where: { artistId: req.user.id }
        });

        const totalLikes = shorts.reduce((sum, s) => sum + (s.likes || 0), 0);
        const totalGiftRevenue = shorts.reduce((sum, s) => sum + ((s.giftsReceived || 0) * 0.05), 0).toFixed(2);

        res.render('shorts-insights', { shorts, totalLikes, totalGiftRevenue });
    } catch (error) {
        console.error('Error rendering Shorts Insights page:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.renderRevenuePage = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized'); // Ensure user is logged in
    try {
        const currentBalance = req.user.walletBalance || 0;
        
        // In a real app, you would aggregate these from a transactions table
        const breakdown = {
            shorts: { amount: currentBalance * 0.6, percentage: 60 },
            live: { amount: currentBalance * 0.4, percentage: 40 },
        };

        // Fetch real withdrawal history if the table exists
        const withdrawals = await prisma.withdrawal?.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        }) || [];

        res.render('revenue', { currentBalance, breakdown, withdrawals });
    } catch (error) {
        console.error('Error rendering Revenue page:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.renderUploadAudioPage = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized'); // Ensure user is logged in
    try {
        res.render('upload-audio', { artistId: req.user.id });
    } catch (error) {
        console.error('Error rendering Upload Audio page:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.renderUploadVideoPage = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized'); // Ensure user is logged in
    try {
        res.render('upload-video', { artistId: req.user.id });
    } catch (error) {
        console.error('Error rendering Upload Video page:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.renderUploadShortsPage = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized'); // Ensure user is logged in
    try {
        res.render('upload-shorts', { artistId: req.user.id });
    } catch (error) {
        console.error('Error rendering Upload Shorts page:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.handleUploadAudio = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized');
    try {
        const { title, genre } = req.body;
        const artistId = req.user.id;
        const audioFile = req.files['audioFile'] ? `/uploads/audio/${req.files['audioFile'][0].filename}` : null;
        const coverArt = req.files['coverArt'] ? `/uploads/images/${req.files['coverArt'][0].filename}` : null;

        if (!audioFile) {
            return res.status(400).render('error', { message: 'Audio file is required.' });
        }

        await prisma.song.create({
            data: {
                title,
                genre,
                audioUrl: audioFile,
                coverArtUrl: coverArt,
                artist: { connect: { id: artistId } },
                playCount: 0, // Initialize play count
            },
        });

        res.redirect('/api/artist/my-music?uploadSuccess=true');
    } catch (error) {
        console.error('Error uploading audio:', error);
        res.status(500).render('error', { message: 'Failed to upload audio. Please try again.' });
    }
};

exports.handleUploadVideo = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized');
    try {
        const { title, description } = req.body;
        const artistId = req.user.id;
        const videoFile = req.files['videoFile'] ? `/uploads/video/${req.files['videoFile'][0].filename}` : null;
        const thumbnail = req.files['thumbnail'] ? `/uploads/images/${req.files['thumbnail'][0].filename}` : null;

        if (!videoFile) {
            return res.status(400).render('error', { message: 'Video file is required.' });
        }

        // Using 'short' model for video content if a specific 'video' model isn't in your schema
        await prisma.short.create({ 
            data: {
                title,
                description,
                videoUrl: videoFile,
                thumbnailUrl: thumbnail,
                artistId: artistId,
                playCount: 0
            },
        });

        res.redirect('/api/artist/my-music?uploadSuccess=true');
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).render('error', { message: 'Failed to upload video. Please try again.' });
    }
};

exports.handleUploadShorts = async (req, res) => {
    if (!req.user) return res.redirect('/?error=Unauthorized');
    try {
        const { title, description } = req.body;
        const artistId = req.user.id;
        const shortFile = req.files['shortFile'] ? `/uploads/video/${req.files['shortFile'][0].filename}` : null; // Shorts also use video storage
        const thumbnail = req.files['thumbnail'] ? `/uploads/images/${req.files['thumbnail'][0].filename}` : null;

        if (!shortFile) {
            return res.status(400).render('error', { message: 'Short video file is required.' });
        }

        await prisma.short.create({ // Assuming you have a 'Short' model in your schema
            data: {
                title,
                description,
                videoUrl: shortFile,
                thumbnailUrl: thumbnail,
                artist: { connect: { id: artistId } },
                playCount: 0, // Initialize play count
                likes: 0,
                giftsReceived: 0,
            },
        });

        res.redirect('/api/artist/my-music?uploadSuccess=true');
    } catch (error) {
        console.error('Error uploading short:', error);
        res.status(500).render('error', { message: 'Failed to upload short. Please try again.' });
    }
};