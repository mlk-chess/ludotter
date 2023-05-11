import { useState } from 'react'
import { supabaseClient } from '../lib/supabaseClient'
import Head from 'next/head'
import React, { useEffect } from "react";
import Link from "next/link";


export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState("")

    const handleLogin = async (event: any) => {
        event.preventDefault()

        const { data, error} = await supabaseClient.auth.signInWithPassword({
            email: email, 
            password: password
        })
    }
    async function fetchData(): Promise<void> {
        const {data : {user}} = await supabaseClient.auth.getUser();
        console.log(user);
    }

    useEffect(()=>{
        fetchData()
    })

    useEffect(() => {
        document.body.classList.add("bg-custom-light-orange");
    });

    

    return (
        <>
            <Head>
                <title>Login to Ludotter</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main>
                <div className="grid h-screen place-items-center">
                    <div
                        className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8">
                        <form className="space-y-6" onSubmit={handleLogin}>
                            {error && <p>{error}</p>}
                            <div>
                                <label htmlFor="email"
                                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    placeholder="email@exemple.com" required />
                            </div>
                            <div>
                                <label htmlFor="password"
                                    className="block mb-2 text-sm font-medium text-gray-900">Mot de passe</label>
                                <input type="password" name="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    required />
                            </div>
                            <button type="submit"
                                className="w-full text-white bg-custom-orange hover:bg-custom-hover-orange focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center">Se connecter
                            </button>
                        </form>
                        <div className="text-sm font-medium text-gray-500 mt-10">
                            Pas de compte ? <Link href="/register" className="text-custom-orange hover:underline">S'inscrire</Link>
                        </div>
                        <div className="text-sm font-medium text-gray-500 mt-5">
                            Mot de passe oublié ? <a href="#" className="text-custom-orange hover:underline">Réinitialiser</a>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}