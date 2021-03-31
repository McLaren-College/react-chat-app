import React, { useEffect, useRef, useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
}));
firebase.initializeApp({
    apiKey: "AIzaSyCiHHipAYX2UAKNs_QjiiUdhWbMct4_nHk",
    authDomain: "react-chat-app-fbad6.firebaseapp.com",
    projectId: "react-chat-app-fbad6",
    storageBucket: "react-chat-app-fbad6.appspot.com",
    messagingSenderId: "845919441529",
    appId: "1:845919441529:web:bba9489475f678bd12faa8",
    measurementId: "G-J4FJV9235Q"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
      <div className="App border-bg h-screen">
        <SignOut />
        <section className="flex justify-center items-center h-screen">
          {user ? <ChatRoom /> : <SignIn />}
        </section>
      </div>
  );
}


function SignIn() {
    const classes = useStyles();
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return (
      <AppBar position="static">
          <Toolbar>

              <Typography variant="h6" className={classes.title}>
                  React Chat App
              </Typography>
              <Button color="inherit" onClick = {(event) => {signInWithGoogle()}}>Login with Google</Button>
          </Toolbar>
      </AppBar>

  )
}

function SignOut() {
  return auth.currentUser && (
      <div className="w-full">
        <button className="" onClick={() => auth.signOut()}>Sign Out</button>
      </div>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'asc').limitToLast(25);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const scrollToBottom = () => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { displayName, uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      user: displayName,
      body: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL: photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
      <div className="chat-bg w-full sm:w-2/3 p-2 rounded">
        <div className="overflow-y-auto h-screen-90">
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </div>

        <form onSubmit={sendMessage} className="pt-3 w-full inline-flex">
          <input className="rounded-3xl px-3 w-full py-1 outline-none focus:shadow" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Say something" />
          <button className={`material-icons p-2 mx-2 bg-white rounded-full transition-all duration-75 ease-in-out text-xl ${!formValue || 'text-pink-700 hover:text-pink-900'}`} type="submit" disabled={!formValue}>send</button>
        </form>
      </div>
  )
}

function ChatMessage(props) {
  const { user, body, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'flex-row-reverse' : 'flex-row';
  const messageBodyClass = uid === auth.currentUser.uid ? 'sent-message-bg text-right' : 'received-message-bg';
  const imageClass = uid === auth.currentUser.uid ? 'ml-2' : 'mr-2';

  return (
      <div className={`px-3 py-2 flex no-wrap items-start ${messageClass}`}>
        <div>
          <img className={`block rounded-full object-cover w-10 ${imageClass}`} src={photoURL || 'https://i.imgur.com/rFbS5ms.png'} alt="{user}'s pfp" />
        </div>
        <div className={`block w-80 break-words p-2 rounded-md ${messageBodyClass}`}>
          <p className="text-xs">{user}</p>
          <p>{body}</p>
        </div>
      </div>
  )
}

export default App;