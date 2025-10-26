// Node server which will handle socket io connections
const io = require('socket.io')(8000, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};

// Get user count
const getUserCount = () => {
    return Object.keys(users).length;
};

io.on('connection', socket => {
    console.log('New user connected:', socket.id);

    // When a new user joins
    socket.on('new-user-joined', name => {
        console.log('New user:', name);
        users[socket.id] = name;
        
        // Broadcast to all other users that someone joined
        socket.broadcast.emit('user-joined', {
            name: name,
            userCount: getUserCount()
        });
        
        // Send current user count to the new user
        socket.emit('user-count', getUserCount());
    });

    // When someone sends a message
    socket.on('send', message => {
        socket.broadcast.emit('receive', {
            message: message,
            name: users[socket.id]
        });
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', users[socket.id]);
        
        if (users[socket.id]) {
            socket.broadcast.emit('left', {
                name: users[socket.id],
                userCount: getUserCount() - 1
            });
            delete users[socket.id];
        }
    });
});

console.log('Server is running on port 8000');