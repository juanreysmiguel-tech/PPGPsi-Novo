"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AppRole =
  | "Visitante"
  | "Discente"
  | "Docente"
  | "Secretaria"
  | "Conselho"
  | "Coordenação"
  | "CG";

interface AppUser {
  uid: string;
  email: string;
  nome: string;
  roles: AppRole[];
}

interface FirebaseContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signingIn: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  appUser: null,
  loading: true,
  signingIn: false,
  signIn: async () => {},
  logOut: async () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const email = firebaseUser.email || "";
        const isSuperAdmin =
          email === "juan.reys.miguel@gmail.com" ||
          email === "ppgpsi@ufscar.br";

        // Fetch or create user profile in Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as AppUser;
          if (isSuperAdmin) {
            // Ensure super admins always have all roles
            const allRoles: AppRole[] = [
              "Discente",
              "Docente",
              "Secretaria",
              "Conselho",
              "Visitante",
            ];
            // Check if they are missing any roles
            const hasAllRoles = allRoles.every((role) =>
              data.roles.includes(role),
            );
            if (!hasAllRoles) {
              await setDoc(
                userRef,
                { ...data, roles: allRoles },
                { merge: true },
              );
              setAppUser({ ...data, roles: allRoles });
            } else {
              setAppUser(data);
            }
          } else {
            setAppUser(data);
          }
        } else {
          // Create new user profile
          const initialRoles: AppRole[] = isSuperAdmin
            ? ["Discente", "Docente", "Secretaria", "Conselho", "Visitante"]
            : ["Visitante"];

          const newUser: AppUser = {
            uid: firebaseUser.uid,
            email: email,
            nome: firebaseUser.displayName || "Usuário",
            roles: initialRoles,
          };
          await setDoc(userRef, newUser);
          setAppUser(newUser);
        }
      } else {
        setAppUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (
        error.code !== "auth/cancelled-popup-request" &&
        error.code !== "auth/popup-closed-by-user"
      ) {
        console.error("Error signing in", error);
        alert("Erro ao fazer login. Por favor, tente novamente.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{ user, appUser, loading, signingIn, signIn, logOut }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}
