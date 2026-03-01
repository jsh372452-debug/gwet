import Gun from 'gun';

// Public Gun relays for zero-cost sync
// Users can add their own peers later
const peers = [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://relay.peer.ooo/gun',
    'https://p2p.dethstrok.com/gun'
];

export const gun = Gun({
    peers: peers,
    localStorage: false // We use IndexedDB for local persistence
});

export const getGunApp = () => gun.get('gwet-global-app-v1');
