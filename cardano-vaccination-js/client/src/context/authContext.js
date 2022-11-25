import React from 'react';

var AuthContext = React.createContext({
    token: null,
    user_id: null,
    login: (token, user_id, user_did) => { },
    logout: () => { }
})

export {
    AuthContext
}