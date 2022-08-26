import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateEmail,
  updateProfile
} from 'firebase/auth'
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import { ulid } from 'ulid'
import { toast } from 'react-toastify'
import { auth, db } from 'firebaseConfig'

import { Game_Collection, Player_Collection, Issue_Collection } from 'constants/collectionName'

import 'react-toastify/dist/ReactToastify.css'

export const signInWithEmail = (
  getDisplayName,
  navigate,
  email,
  password,
  setSubmitButtonDisabled,
  handleModal,
  setUserData,
  setError
) => {
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      setSubmitButtonDisabled(false)
      handleModal()
      setUserData({ email: '', password: '' })
      navigate('/')
      getDisplayName()
    })
    .catch(error => {
      setSubmitButtonDisabled(false)
      setError(error.message)
    })
}

export const signUpWithEmails = (
  getDisplayName,
  navigate,
  email,
  password,
  name,
  setSubmitButtonDisabled,
  handleModal,
  setUserData,
  setError
) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async response => {
      setSubmitButtonDisabled(false)
      const user = response.user
      await updateProfile(user, {
        displayName: name
      })
      handleModal()
      setUserData({ name: '', email: '', password: '', repeatPassword: '' })
      navigate('/')
      getDisplayName()
    })
    .catch(error => {
      setSubmitButtonDisabled(false)
      setError(error.message)
    })
}

const gamesCollectionName = collection(db, Game_Collection)
const playersCollectionName = collection(db, Player_Collection)
const issueCollectionName = collection(db, Issue_Collection)

export const addGameToStore = async (gameId, data) => {
  await setDoc(doc(gamesCollectionName, gameId), data)
  return true
}

export const getGameFromStore = async id => {
  const docRef = doc(db, Game_Collection, id)
  const result = await getDoc(docRef)
  let game = undefined
  if (result.exists) {
    game = result.data()
  }
  return game
}

export const addPlayersToStore = async (playerId, data) => {
  await setDoc(doc(playersCollectionName, playerId), data)
  return true
}

export const updatePlayerInGameInStore = async (id, data) => {
  const docRef = doc(gamesCollectionName, id)
  await updateDoc(docRef, {
    player: arrayUnion(data)
  })
}

export const addIssueToStore = async (gameId, title) => {
  const issue = { id: ulid(), title, gameId }
  setDoc(doc(issueCollectionName, issue.id), issue)

  return true
}

export const deleteIssueToStore = async (id, gameId) => {
  await deleteDoc(doc(db, Issue_Collection, id))
  getIssueFromStore(gameId)

  return true
}

export const getPlayerFromStore = async (gameId, playerId) => {
  const docRef = doc(db, Player_Collection, playerId)
  const docData = await getDoc(docRef)
  let player = undefined
  if (docData.exists()) {
    player = docData.data()
  } else {
    toast.error('No data founded!', { theme: 'colored' })
  }
  return player
}

export const updatePlayerInStore = async (gameId, player) => {
  await setDoc(doc(db, Player_Collection, player.id), player)

  return true
}

export const getPlayersFromStore = async gameId => {
  let players = []
  const getPlayerQuery = query(collection(db, Player_Collection), where('gameId', '==', gameId))
  const docData = await getDocs(getPlayerQuery)
  docData.forEach(doc => {
    players.push(doc.data())
  })

  return players
}

export const updateGameDataInStore = async (gameId, data) => {
  const docRef = doc(db, Game_Collection, gameId)
  await updateDoc(docRef, data)

  return true
}

export const getCompleteGameData = id =>
  query(collection(db, Game_Collection), where('id', '==', id))

export const getAllPlayersFromStore = id =>
  query(collection(db, Player_Collection), where('gameId', '==', id))

export const getIssueFromStore = id =>
  query(collection(db, Issue_Collection), where('gameId', '==', id))

export const changeProfileNameInStore = (
  name,
  setBooleanStates,
  booleanStates,
  getDisplayName,
  setAccountData
) => {
  const auth = getAuth()

  if (name) {
    updateProfile(auth.currentUser, {
      displayName: name
    }).then(() => {
      setBooleanStates({ ...booleanStates, nameDiv: !booleanStates.nameDiv })
      getDisplayName()
      setAccountData({ name: '', email: '', password: '' })
    })
  }
}

export const changeEmailInStore = (
  email,
  setBooleanStates,
  booleanStates,
  getDisplayName,
  setAccountData
) => {
  const auth = getAuth()
  const newEmail = email
  if (email) {
    updateEmail(auth.currentUser, newEmail).then(() => {
      setBooleanStates({ ...booleanStates, emailDiv: !booleanStates.emailDiv })
      getDisplayName()
      setAccountData({ name: '', email: '', password: '' })
    })
  }
}

export const changePasswordInStore = (
  password,
  setBooleanStates,
  booleanStates,
  setAccountData
) => {
  const auth = getAuth()
  const user = auth.currentUser
  const newPassword = password

  if (password) {
    updatePassword(user, newPassword).then(() => {
      setBooleanStates({ ...booleanStates, passwordDiv: !booleanStates.passwordDiv })
      setAccountData({ name: '', email: '', password: '' })
    })
  }
}

export const deleteUserFromStore = (handleModal, getDisplayName, setAccountData) => {
  const auth = getAuth()
  const user = auth.currentUser

  deleteUser(user).then(() => {
    handleModal()
    getDisplayName()
    setAccountData({ name: '', email: '', password: '' })
  })
}
