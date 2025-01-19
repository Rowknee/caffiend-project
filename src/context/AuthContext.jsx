import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { createContext } from 'react'
import { useState, useEffect, useContext} from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}


export function AuthProvider(props) {
    const { children } = props
    const [globalUser, setGlobalUser] = useState(null)
    const [globalData, setGlobalData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('Current User:', user)
            setGlobalUser(user)
            //  if there no use empyt the user state and return from this listener

            if (!user) { 
                console.log('No active user')
                return
             }

            //  if there is a user then check if the user has data in the Database, and if they do then fetch said data and update the global state
            try {
                setIsLoading(true)

                //  first we create a refeernce for the document (labelled json object), and then we get the doc, and then we snapshot it to see if theres anything there
                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)
                
                let firebaseData = {}
                if (docSnap.exists()) {
                    firebaseData = docSnap.data()
                    console.log('Found user data', firebaseData)
                }
                setGlobalData(firebaseData)
            } catch(err) {
                console.log(err.message)
            } finally {
                setIsLoading(false)

            }
            
        })
        return unsubscribe

    }, [])

    const value = {globalUser, globalData, setGlobalData, isLoading, setIsLoading, signup, login, logout}

    function signup(email,password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email,password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth,email)
    }

    function logout() {
        setGlobalUser(null)
        setGlobalData(null)
        return signOut(auth)
    }


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>

    )
}